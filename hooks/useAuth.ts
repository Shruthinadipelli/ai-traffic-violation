"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@/lib/types"
import { getUser, saveUser, clearUser, createUser } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = getUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(
    (email: string, password: string) => {
      // In a real app, this would validate credentials against a backend
      // For now, we'll accept any email/password combo and check localStorage
      const user = getUser()
      if (user && user.email === email) {
        return { success: true, user }
      }
      return { success: false, error: "Invalid credentials" }
    },
    []
  )

  const register = useCallback(
    (
      email: string,
      password: string,
      name: string,
      role: "vehicle_owner" | "traffic_officer",
      vehicle_number?: string
    ) => {
      // Check if user already exists
      const existingUser = getUser()
      if (existingUser && existingUser.email === email) {
        return { success: false, error: "User already exists" }
      }

      // Create new user
      const newUser = createUser(email, name, role, vehicle_number)
      saveUser(newUser)
      setUser(newUser)
      return { success: true, user: newUser }
    },
    []
  )

  const logout = useCallback(() => {
    clearUser()
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    saveUser(updatedUser)
    setUser(updatedUser)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    updateUser,
  }
}
