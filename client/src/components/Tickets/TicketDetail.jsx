import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ticketsAPI } from '../../services/tickets'
import { agentAPI } from '../../services/agent'
import { auditAPI } from '../../services/audit'
import Loading from '../Common/Loading'

const TicketDetail = ({ setError }) => {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')

  useEffect(() => {
    fetchTicketData()
  }, [id])

  const fetchTicketData = async () => {
    try {
      setLoading(true)
      const [ticketRes, auditRes] = await Promise.all([
        ticketsAPI.getTicket(id),
        auditAPI.getAuditLogs(id)
      ])
      
      setTicket(ticketRes.data)
      setAuditLogs(auditRes.data)

      // If there's an agent suggestion, fetch it
      if (ticketRes.data.agentSuggestion) {
        try {
          const suggestionRes = await agentAPI.getSuggestion(id)
          setSuggestion(suggestionRes.data)
        } catch (error) {
          console.error('Failed to fetch suggestion:', error)
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch ticket data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!reply.trim()) return

    setReplying(true)
    try {
      await ticketsAPI.sendReply(id, {
        message: reply,
        status: 'resolved',
        useSuggestion: false
      })
      setReply('')
      fetchTicketData() // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  const handleUseSuggestion = async () => {
    setReplying(true)
    try {
      await ticketsAPI.sendReply(id, {
        message: suggestion.draftReply,
        status: 'resolved',
        useSuggestion: true
      })
      fetchTicketData() // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to use suggestion')
    } finally {
      setReplying(false)
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-gray-900">{ticket.title}</h1>
            {getStatusBadge(ticket.status)}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created by {ticket.createdBy.name} on {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500">Description</h2>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Category</h2>
              <p className="mt-1 text-sm text-gray-900 capitalize">{ticket.category}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Assignee</h2>
              <p className="mt-1 text-sm text-gray-900">
                {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Agent Suggestion */}
          {suggestion && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <h2 className="text-sm font-medium text-blue-800 mb-2">AI Agent Suggestion</h2>
              <div className="text-sm text-blue-700 mb-2">
                <strong>Predicted Category:</strong> {suggestion.predictedCategory} 
                (Confidence: {(suggestion.confidence * 100).toFixed(1)}%)
              </div>
              <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{suggestion.draftReply}</p>
              </div>
              {ticket.status === 'waiting_human' && user.role !== 'user' && (
                <button
                  onClick={handleUseSuggestion}
                  disabled={replying}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {replying ? 'Sending...' : 'Use This Suggestion'}
                </button>
              )}
            </div>
          )}

          {/* Reply Form (for agents/admins) */}
          {user.role !== 'user' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Send Reply</h2>
              <form onSubmit={handleSendReply}>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Type your response here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="mt-2">
                  <button
                    type="submit"
                    disabled={replying || !reply.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {replying ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit Log */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h2>
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log._id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`h-2 w-2 rounded-full ${
                      log.actor === 'system' ? 'bg-blue-500' : 
                      log.actor === 'agent' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()} • {log.actor}
                    </p>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <pre>{JSON.stringify(log.meta, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail