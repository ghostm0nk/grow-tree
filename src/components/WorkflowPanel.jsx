import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function WorkflowPanel({ tree, session, workflows, setWorkflows }) {
  const [showWorkflowForm, setShowWorkflowForm] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const createWorkflow = async (e) => {
    e.preventDefault()
    if (!workflowName.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([
          {
            name: workflowName.trim(),
            description: workflowDescription.trim(),
            tree_id: tree.id,
            user_id: session.user.id,
            steps: [],
          }
        ])
        .select()
        .single()

      if (error) throw error
      setWorkflows([...workflows, data])
      setWorkflowName('')
      setWorkflowDescription('')
      setShowWorkflowForm(false)
    } catch (error) {
      console.error('Error creating workflow:', error)
      alert('Error creating workflow: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkflow = async (workflowId) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)

      if (error) throw error
      setWorkflows(workflows.filter(w => w.id !== workflowId))
    } catch (error) {
      console.error('Error deleting workflow:', error)
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Workflows</h3>
          <button
            onClick={() => setShowWorkflowForm(!showWorkflowForm)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            + New
          </button>
        </div>

        {showWorkflowForm && (
          <form onSubmit={createWorkflow} className="space-y-3">
            <input
              type="text"
              placeholder="Workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="input-field"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="input-field"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 text-sm"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowWorkflowForm(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              {workflow.description && (
                <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{workflow.steps?.length || 0} steps</span>
                <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {workflows.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No workflows yet. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}