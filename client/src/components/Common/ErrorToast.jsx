import { useEffect } from 'react'

const ErrorToast = ({ error, onClose }) => {
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, onClose])

  if (!error) return null

  return (
    <div className="toast error">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 inline-flex text-white focus:outline-none"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ErrorToast