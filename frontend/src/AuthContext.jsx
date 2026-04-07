import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getAuthToken,
  setAuthToken,
  login as loginApi,
  googleLogin as googleLoginApi,
  register as registerApi,
  getCurrentUser,
  logout as logoutApi,
} from './api'

const AuthContext = createContext(null)

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }
    getCurrentUser()
      .then((response) => {
        setUser(response.data.user)
      })
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await loginApi({ email, password })
    setAuthToken(response.data.token)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const response = await registerApi({ name, email, password })
    setAuthToken(response.data.token)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    const response = await googleLoginApi(idToken)
    setAuthToken(response.data.token)
    setUser(response.data.user)
    return response.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore network failures during logout and clear local auth anyway.
    }
    setAuthToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  return useContext(AuthContext)
}
