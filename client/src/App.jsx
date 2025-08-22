import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import KBList from './components/KB/KBList'
import KBEditor from './components/KB/KBEditor'
import TicketList from './components/Tickets/TicketList'
import TicketDetail from './components/Tickets/TicketDetail'
import CreateTicket from './components/Tickets/CreateTicket'
import Loading from './components/Common/Loading'
import ErrorToast from './components/Common/ErrorToast'
import ErrorBoundary from './components/Common/ErrorBoundary'

// import '/App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
     <ErrorBoundary>
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <ErrorToast error={error} onClose={() => setError(null)} />
            <Routes>
              <Route path="/login" element={<Login setError={setError} />} />
              <Route path="/register" element={<Register setError={setError} />} />
              <Route path="/kb" element={<KBList setError={setError} />} />
              <Route path="/kb/:id/edit" element={<KBEditor setError={setError} />} />
              <Route path="/tickets" element={<TicketList setError={setError} />} />
              <Route path="/tickets/create" element={<CreateTicket setError={setError} />} />
              <Route path="/tickets/:id" element={<TicketDetail setError={setError} />} />
              <Route path="/" element={<TicketList setError={setError} />} />
            </Routes>
          </Layout>


         
        </div>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App