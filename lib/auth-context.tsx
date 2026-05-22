'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, users as mockUsers } from '@/lib/data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('user', JSON.stringify(foundUser))
      return { success: true, message: 'Dang nhap thanh cong!' }
    }
    
    return { success: false, message: 'Email hoac mat khau khong dung!' }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const existingUser = mockUsers.find(u => u.email === data.email)
    if (existingUser) {
      return { success: false, message: 'Email da ton tai!' }
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      ...data,
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    return { success: true, message: 'Dang ky thanh cong!' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true, message: 'Cap nhat thanh cong!' }
    }
    
    return { success: false, message: 'Co loi xay ra!' }
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
