// lib/seed-data.ts
// ==================
// Fallback seed data that mirrors the MySQL seed.sql content.
// Used by Next.js API routes when the Flask backend is unreachable,
// so the dashboard always renders with realistic data.

import type { DashboardData, Violation, ChallanRecord } from "./types"

export const seedViolations: Violation[] = [
  { id: "V-001", plate: "MH12AB1234", type: "speeding", speed: "102.5", limit: "80", camera: "NH-48 Toll Plaza", confidence: 0.94, status: "confirmed", time: "2026-02-25 08:14" },
  { id: "V-002", plate: "KA05CD5678", type: "red_light", speed: null, limit: "60", camera: "MG Road Junction", confidence: 0.88, status: "confirmed", time: "2026-02-25 09:32" },
  { id: "V-003", plate: "DL08EF9012", type: "speeding", speed: "85.3", limit: "60", camera: "Ring Road Sector 15", confidence: 0.91, status: "pending", time: "2026-02-25 10:05" },
  { id: "V-004", plate: "TN09GH3456", type: "wrong_lane", speed: null, limit: "80", camera: "Eastern Express Highway", confidence: 0.76, status: "pending", time: "2026-02-25 11:20" },
  { id: "V-005", plate: "MH12AB1234", type: "speeding", speed: "68.0", limit: "50", camera: "Anna Salai Signal", confidence: 0.85, status: "confirmed", time: "2026-02-25 12:45" },
  { id: "V-006", plate: "MH14JK7890", type: "speeding", speed: "95.0", limit: "80", camera: "NH-48 Toll Plaza", confidence: 0.92, status: "pending", time: "2026-02-25 13:18" },
  { id: "V-007", plate: "KA05CD5678", type: "no_helmet", speed: null, limit: "60", camera: "Ring Road Sector 15", confidence: 0.89, status: "confirmed", time: "2026-02-25 14:02" },
  { id: "V-008", plate: "GJ01XY4567", type: "speeding", speed: "112.0", limit: "80", camera: "NH-48 Toll Plaza", confidence: 0.96, status: "pending", time: "2026-02-25 14:55" },
  { id: "V-009", plate: "RJ14MN2345", type: "no_seatbelt", speed: null, limit: "60", camera: "MG Road Junction", confidence: 0.82, status: "dismissed", time: "2026-02-25 15:30" },
  { id: "V-010", plate: "UP16PQ8901", type: "red_light", speed: null, limit: "60", camera: "Anna Salai Signal", confidence: 0.91, status: "pending", time: "2026-02-25 16:12" },
]

export const seedChallans: ChallanRecord[] = [
  { challanNumber: "CH-A1B2C3D4E5", violationId: "V-001", plate: "MH12AB1234", type: "Speeding", fine: 2000, dueDate: "2026-03-25", status: "paid" },
  { challanNumber: "CH-F6G7H8I9J0", violationId: "V-002", plate: "KA05CD5678", type: "Red Light", fine: 5000, dueDate: "2026-03-28", status: "unpaid" },
  { challanNumber: "CH-K1L2M3N4O5", violationId: "V-005", plate: "MH12AB1234", type: "Speeding", fine: 2000, dueDate: "2026-03-30", status: "unpaid" },
  { challanNumber: "CH-P6Q7R8S9T0", violationId: "V-007", plate: "KA05CD5678", type: "No Helmet", fine: 1000, dueDate: "2026-04-01", status: "overdue" },
  { challanNumber: "CH-U1V2W3X4Y5", violationId: "V-008", plate: "GJ01XY4567", type: "Speeding", fine: 2000, dueDate: "2026-04-05", status: "unpaid" },
  { challanNumber: "CH-Z6A7B8C9D0", violationId: "V-010", plate: "UP16PQ8901", type: "Red Light", fine: 5000, dueDate: "2026-04-10", status: "unpaid" },
]

export const seedDashboard: DashboardData = {
  stats: {
    total_violations: 1284,
    vehicles_detected: 8432,
    pending_review: 342,
    challans_issued: 942,
    fines_collected: 1880000,
    resolved: 612,
  },
  violations: seedViolations,
  challans: seedChallans,
  charts: {
    timeline: [
      { date: "Feb 1", count: 32 },
      { date: "Feb 3", count: 45 },
      { date: "Feb 5", count: 28 },
      { date: "Feb 7", count: 56 },
      { date: "Feb 9", count: 41 },
      { date: "Feb 11", count: 38 },
      { date: "Feb 13", count: 62 },
      { date: "Feb 15", count: 48 },
      { date: "Feb 17", count: 55 },
      { date: "Feb 19", count: 71 },
      { date: "Feb 21", count: 44 },
      { date: "Feb 23", count: 59 },
      { date: "Feb 25", count: 67 },
    ],
    by_type: [
      { type: "Speeding", count: 524 },
      { type: "Red Light", count: 312 },
      { type: "Wrong Lane", count: 178 },
      { type: "No Helmet", count: 156 },
      { type: "No Seatbelt", count: 114 },
    ],
    by_camera: [
      { name: "NH-48 Toll", value: 380 },
      { name: "MG Road", value: 290 },
      { name: "Ring Road", value: 245 },
      { name: "Eastern Exp", value: 210 },
      { name: "Anna Salai", value: 159 },
    ],
  },
}
