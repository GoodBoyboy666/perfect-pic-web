import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchClient } from '../lib/api'

export interface User {
  id: number
  username: string
  admin: boolean
  avatar?: string
  storage_quota: number | null
  storage_used: number
  status: number
  email: string
  email_verified: boolean
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetchClient('/api/user/profile')
      // Assuming the API returns the user object directly or nested.
      // Adjust based on actual API response structure.
      setUser(res.data || res)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (formData: any) => {
    const res: any = await fetchClient('/api/login', {
      method: 'POST',
      body: formData,
    })
    if (res && res.token) {
      localStorage.setItem('token', res.token)
    }
    await refreshUser()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
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
