// App.jsx
import React, { useState, useEffect } from 'react'
import { 
  getAllTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from './api'
import './index.css'

const App = () => {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [editingId, setEditingId] = useState(null)

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAllTodos()
      setTodos(response.data)
    } catch (err) {
      setError('Failed to fetch todos')
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (editingId) {
        // Update existing todo
        await updateTodo(editingId, formData)
        setEditingId(null)
      } else {
        // Create new todo
        await createTodo(formData)
      }
      
      setFormData({ title: '', description: '' })
      await fetchTodos()
    } catch (err) {
      setError('Failed to save todo')
      console.error('Error saving todo:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (todo) => {
    setFormData({
      title: todo.title,
      description: todo.description
    })
    setEditingId(todo.id)
  }

  const handleCancelEdit = () => {
    setFormData({ title: '', description: '' })
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return
    }

    setLoading(true)
    try {
      await deleteTodo(id)
      await fetchTodos()
    } catch (err) {
      setError('Failed to delete todo')
      console.error('Error deleting todo:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>📝 My Todo App</h1>
          <p>Stay organized and productive</p>
        </header>

        {/* Todo Form */}
        <div className="todo-form-section">
          <form onSubmit={handleSubmit} className="todo-form">
            <h2>{editingId ? 'Edit Todo' : 'Add New Todo'}</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What needs to be done?"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add more details..."
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !formData.title.trim()}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Todo' : 'Add Todo')}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Todo List */}
        <div className="todo-list-section">
          <div className="section-header">
            <h2>My Todos ({todos.length})</h2>
            <button 
              onClick={fetchTodos} 
              className="btn btn-outline"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {loading && todos.length === 0 ? (
            <div className="loading">Loading todos...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No todos yet</h3>
              <p>Add your first todo to get started!</p>
            </div>
          ) : (
            <div className="todo-list">
              {todos.map(todo => (
                <div key={todo.id} className="todo-card">
                  <div className="todo-content">
                    <h3 className="todo-title">{todo.title}</h3>
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                    <div className="todo-meta">
                      <span className="todo-date">
                        Created: {new Date(todo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="todo-actions">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="btn-action btn-edit"
                      title="Edit todo"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="btn-action btn-delete"
                      title="Delete todo"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App