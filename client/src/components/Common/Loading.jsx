const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default Loading