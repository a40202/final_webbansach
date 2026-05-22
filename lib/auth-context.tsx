'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  authApi,
  ApiError,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  type PublicUser,
} from '@/lib/api'

interface AuthContextType {
  user: PublicUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (data: Partial<PublicUser>) => Promise<{ success: boolean; message: string }>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function persistSession(user: PublicUser, token: string) {
  setAccessToken(token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = getAccessToken()
      const savedUser = localStorage.getItem('user')
      if (!token || !savedUser) {
        setIsLoading(false)
        return
      }
      try {
        const me = await authApi.me()
        setUser(me)
        localStorage.setItem('user', JSON.stringify(me))
      } catch {
        clearAccessToken()
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedIn, accessToken } = await authApi.login(email, password)
      setUser(loggedIn)
      persistSession(loggedIn, accessToken)
      return { success: true, message: 'Dang nhap thanh cong!' }
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Email hoac mat khau khong dung!'
      return { success: false, message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const { user: newUser, accessToken } = await authApi.register(data)
      setUser(newUser)
      persistSession(newUser, accessToken)
      return { success: true, message: 'Dang ky thanh cong!' }
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Co loi xay ra khi dang ky!'
      return { success: false, message }
    }
  }

  const logout = () => {
    setUser(null)
    clearAccessToken()
    localStorage.removeItem('user')
  }

  const updateProfile = async (data: Partial<PublicUser>) => {
    if (!user) {
      return { success: false, message: 'Co loi xay ra!' }
    }
    try {
      const updated = await authApi.updateProfile(data)
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      return { success: true, message: 'Cap nhat thanh cong!' }
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Co loi xay ra!'
      return { success: false, message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
