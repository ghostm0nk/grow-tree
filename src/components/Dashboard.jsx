import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TreeCanvas from './TreeCanvas'
import TaskPanel from './TaskPanel'
import ProfileSettings from './ProfileSettings'

export default function Dashboard({ session }) {
  const [trees, setTrees] = useState([])
  const [activeTree, setActiveTree] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrees()
  }, [])

  const fetchTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrees(data || [])
      if (data && data.length > 0 && !activeTree) {
        setActiveTree(data[0])
      }
    } catch (error) {
      console.error('Error fetching trees:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewTree = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .insert([
          {
            user_id: session.user.id,
            name: 'New Tree',
            description: 'A new tree to grow your tasks',
          }
        ])
        .select()
        .single()

      if (error) throw error
      setTrees([data, ...trees])
      setActiveTree(data)
    } catch (error) {
      console.error('Error creating tree:', error)
    }
  }

  if (showProfile) {
    return <ProfileSettings session={session} onClose={() => setShowProfile(false)} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewTree}
            className="w-full btn-primary"
          >
            New Tree
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="p-4 space-y-2">
              {trees.map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => setActiveTree(tree)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${activeTree?.id === tree.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <div className="font-medium">{tree.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(tree.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full btn-secondary"
          >
            Profile Settings
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {activeTree ? (
          <>
            <TreeCanvas tree={activeTree} session={session} />
            <TaskPanel tree={activeTree} session={session} />
            <WorkflowPanel tree={activeTree} session={session} workflows={workflows} setWorkflows={setWorkflows} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Tree Selected</h2>
              <p className="text-gray-500">Create a new tree to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}