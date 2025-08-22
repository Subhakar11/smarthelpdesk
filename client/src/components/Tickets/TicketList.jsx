import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ticketsAPI } from '../../services/tickets'
import Loading from '../Common/Loading'

const TicketList = ({ setError }) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      let url = '/tickets'
      if (filter !== 'all') {
        url += `?status=${filter}`
      }
      
      const response = await ticketsAPI.getTickets()
      setTickets(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-blue-100 text-blue-800',
      triaged: 'bg-purple-100 text-purple-800',
      waiting_human: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all support tickets in the system.
          </p>
        </div>
        
        {user?.role === 'user' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/tickets/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Ticket
            </Link>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['all', 'open', 'waiting_human', 'resolved', 'closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                filter === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('_', ' ').toUpperCase()} ({tab === 'all' ? tickets.length : tickets.filter(t => t.status === tab).length})
            </button>
          ))}
        </nav>
      </div>

      {/* Tickets list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No tickets found
            </li>
          ) : (
            tickets.map((ticket) => (
              <li key={ticket._id}>
                <Link to={`/tickets/${ticket._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {ticket.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {ticket.category}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default TicketList