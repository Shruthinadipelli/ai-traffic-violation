"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getUser } from "@/lib/auth"

const PUBLIC_ROUTES = ["/", "/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()

  useEffect(() => {
    // Allow public routes without authentication
    if (PUBLIC_ROUTES.includes(pathname)) {
      return
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // Role-based routing: if user is vehicle owner and tries to access /dashboard, redirect to /owner-dashboard
    if (user.role === "vehicle_owner" && pathname === "/dashboard") {
      router.push("/owner-dashboard")
      return
    }

    // If user is traffic officer and tries to access /owner-dashboard, redirect to /dashboard
    if (user.role === "traffic_officer" && pathname === "/owner-dashboard") {
      router.push("/dashboard")
      return
    }
  }, [user, pathname, router])

  return <>{children}</>
}
