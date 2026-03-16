// lib/types.ts
// =============
// Shared TypeScript interfaces used by both the API routes
// and the React dashboard components.

export type ViolationStatus = "pending" | "confirmed" | "dismissed"
export type ViolationType = "speeding" | "red_light" | "wrong_lane" | "no_helmet" | "no_seatbelt"
export type ChallanStatus = "unpaid" | "paid" | "overdue"

export interface Violation {
  id: string
  plate: string
  type: ViolationType
  speed: string | null
  limit: string | null
  camera: string
  confidence: number
  status: ViolationStatus
  time: string
}

export interface ChallanRecord {
  challanNumber: string
  violationId: string
  plate: string
  type: string
  fine: number
  dueDate: string
  status: ChallanStatus
}

export interface DashboardStats {
  total_violations: number
  vehicles_detected: number
  pending_review: number
  challans_issued: number
  fines_collected: number
  resolved: number
}

export interface ChartData {
  timeline: { date: string; count: number }[]
  by_type: { type: string; count: number }[]
  by_camera: { name: string; value: number }[]
}

export interface DashboardData {
  stats: DashboardStats
  violations: Violation[]
  challans: ChallanRecord[]
  charts: ChartData
}

export type UserRole = "vehicle_owner" | "traffic_officer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  vehicle_number?: string
  created_at: string
}

export interface PaymentRecord {
  challanNumber: string
  violationId: string
  plate: string
  amount: number
  paid_at: string | null
  payment_method: "upi" | "card" | "cash" | null
  upi_transaction_id?: string
}
