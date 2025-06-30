"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Load auth data from localStorage
    const savedToken = localStorage.getItem("adminToken")
    const savedUser = localStorage.getItem("adminUser")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password)

      setToken(response.token)
      setUser(response.user)

      localStorage.setItem("adminToken", response.token)
      localStorage.setItem("adminUser", JSON.stringify(response.user))
    } catch (error) {
      throw new Error("Login failed")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
