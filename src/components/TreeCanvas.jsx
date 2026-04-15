import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TreeCanvas({ tree, session }) {
  const [tasks, setTasks] = useState([])
  const [branches, setBranches] = useState([])

  useEffect(() => {
    fetchTasks()
  }, [tree])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('tree_id', tree.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTasks(data || [])
      generateBranches(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const generateBranches = (tasks) => {
    const newBranches = tasks.map((task, index) => ({
      id: task.id,
      x: 400 + Math.cos((index / tasks.length) * Math.PI * 2) * 150,
      y: 300 + Math.sin((index / tasks.length) * Math.PI * 2) * 150,
      completed: task.completed,
      name: task.name,
      level: task.level || 1,
    }))
    setBranches(newBranches)
  }

  const toggleTaskCompletion = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="flex-1 relative bg-gradient-to-b from-blue-50 to-green-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{tree.name}</h2>
          <p className="text-gray-600">{tree.description}</p>
        </div>
      </div>

      {branches.map((branch) => (
        <div
          key={branch.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: branch.x, top: branch.y }}
        >
          <div
            className={`w-4 h-4 rounded-full transition-all duration-300 group-hover:scale-150 ${branch.completed ? 'bg-green-500' : 'bg-orange-400'
              }`}
            onClick={() => toggleTaskCompletion(branch.id)}
          />
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap">
            {branch.name}
          </div>
        </div>
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {branches.map((branch, index) => {
          const nextBranch = branches[(index + 1) % branches.length]
          return (
            <line
              key={`line-${branch.id}`}
              x1={branch.x}
              y1={branch.y}
              x2={nextBranch.x}
              y2={nextBranch.y}
              stroke="#94a3b8"
              strokeWidth="2"
              opacity="0.5"
            />
          )
        })}
      </svg>
    </div>
  )
}