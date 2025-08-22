import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { kbAPI } from '../../services/kb'
import Loading from '../Common/Loading'

const KBList = ({ setError }) => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async (query = '') => {
    try {
      setLoading(true)
      const url = query ? `?query=${encodeURIComponent(query)}` : ''
      const response = await kbAPI.getArticles(url)
      setArticles(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchArticles(searchQuery)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await kbAPI.deleteArticle(id)
      setArticles(articles.filter(article => article._id !== id))
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete article')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="mt-2 text-sm text-gray-700">
            A collection of helpful articles for common issues.
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/kb/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Article
            </Link>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search articles..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Articles list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {articles.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            No articles found. {user?.role === 'admin' && 'Create your first article!'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {articles.map((article) => (
              <li key={article._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-indigo-600">
                      {article.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {article.body}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated {new Date(article.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="mt-4 flex space-x-2">
                      <Link
                        to={`/kb/${article._id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default KBList