import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsAPI } from '../../services/tickets'

const CreateTicket = ({ setError }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other'
  })
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  // Validate form data
  if (!formData.title || formData.title.length < 5) {
    setError('Title must be at least 5 characters');
    setSubmitting(false);
    return;
  }

  if (!formData.description || formData.description.length < 10) {
    setError('Description must be at least 10 characters');
    setSubmitting(false);
    return;
  }

  try {
    const ticketData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category
    };

    console.log('Submitting ticket:', ticketData);
    
    await ticketsAPI.createTicket(ticketData);
    navigate('/tickets');
  } catch (error) {
    console.error('Failed to create ticket:', error);
    console.error('Error response:', error.response?.data);
    
    // Show detailed error message from server
    if (error.response?.data?.errors) {
      setError(error.response.data.errors.join(', '));
    } else {
      setError(error.response?.data?.message || 'Failed to create ticket');
    }
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create New Ticket
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Brief description of your issue"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="billing">Billing</option>
                <option value="tech">Technical</option>
                <option value="shipping">Shipping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Please provide detailed information about your issue..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTicket