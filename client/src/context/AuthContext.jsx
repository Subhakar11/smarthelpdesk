import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/auth"

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
      try {
        const token = localStorage.getItem("token")
        if (token) {
          try {
            // Verify with backend
            const response = await authAPI.getMe()
            const user = response.data

            dispatch({
              type: "LOGIN_SUCCESS",
              payload: user,
            })
          } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            dispatch({ type: "AUTH_CHECK_COMPLETE" })
          }
        } else {
          dispatch({ type: "AUTH_CHECK_COMPLETE" })
        }
      } catch (error) {
        console.error("Error during auth check:", error)
        dispatch({ type: "AUTH_CHECK_COMPLETE" })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await authAPI.login(email, password)
      const { token, ...user } = response.data // ✅ token + user fields

      // Store safely
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: user,
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed"
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      })

      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    ...state,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
