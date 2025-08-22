import { createContext, useContext, useReducer, useEffect } from "react"
import api from "../services/api" // axios instance

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null }
    case "LOGIN_SUCCESS":
      return { ...state, loading: false, user: action.payload, isAuthenticated: true, error: null }
    case "LOGIN_FAILURE":
      return { ...state, loading: false, user: null, isAuthenticated: false, error: action.payload }
    case "LOGOUT":
      return { ...state, loading: false, user: null, isAuthenticated: false, error: null }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "AUTH_CHECK_COMPLETE":
      return { ...state, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const res = await api.get('/auth/me') // backend route to get current user
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data })
        } catch {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          dispatch({ type: "AUTH_CHECK_COMPLETE" })
        }
      } else {
        dispatch({ type: "AUTH_CHECK_COMPLETE" })
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, ...user } = res.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({ type: "LOGIN_SUCCESS", payload: user })

      return { success: true }
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed"
      dispatch({ type: "LOGIN_FAILURE", payload: msg })
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  const clearError = () => dispatch({ type: "CLEAR_ERROR" })

  const setUser = (user) => dispatch({ type: "LOGIN_SUCCESS", payload: user })

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
