import type { User, UserRole } from "./types"

const USER_STORAGE_KEY = "traffic_eye_user"
const PAYMENT_STORAGE_KEY = "traffic_eye_payments"

export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

export function clearUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function isUserLoggedIn(): boolean {
  return getUser() !== null
}

export function getUserRole(): UserRole | null {
  const user = getUser()
  return user?.role ?? null
}

export function createUser(
  email: string,
  name: string,
  role: UserRole,
  vehicle_number?: string
): User {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    email,
    role,
    vehicle_number,
    created_at: new Date().toISOString(),
  }
}
