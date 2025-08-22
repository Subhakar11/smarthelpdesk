import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Loading from '../Common/Loading'

const Layout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!loading && !isAuthenticated && !['/login', '/register'].includes(location.pathname)) {
      navigate('/login', { 
        replace: true,
        state: { from: location } // Preserve the intended destination
      })
    }
  }, [isAuthenticated, loading, location, navigate])

  // Show loading while checking authentication
  if (loading) {
    return <Loading message="Checking authentication..." />
  }

  // Don't show navbar on login/register pages for non-authenticated users
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <main>{children}</main>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main>{children}</main>
    </div>
  )
}

export default Layout