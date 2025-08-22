import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { kbAPI } from '../../services/kb'
import Loading from '../Common/Loading'

const KBEditor = ({ setError }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditMode = id !== 'new'
  
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    status: 'draft'
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (isEditMode) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await kbAPI.getArticle(id)
      setFormData({
        title: response.data.title,
        body: response.data.body,
        tags: response.data.tags || [],
        status: response.data.status
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch article')
      navigate('/kb')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditMode) {
        await kbAPI.updateArticle(id, formData)
      } else {
        await kbAPI.createArticle(formData)
      }
      navigate('/kb')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Article' : 'Create New Article'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-md p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="body"
            name="body"
            rows="10"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.body}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="mt-1 flex">
            <input
              type="text"
              id="tags"
              className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span key={tag} className="inline-flex items-center py-0.5 pl-2 pr-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/kb')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default KBEditor