// app/api/dashboard/route.ts
// ===========================
// Proxies to Flask GET /api/dashboard for unified dashboard data.
// Falls back to seed data when Flask is unreachable.

import { NextResponse } from "next/server"
import { fetchFlask } from "@/lib/api-config"
import { seedDashboard } from "@/lib/seed-data"
import type { DashboardData } from "@/lib/types"

export async function GET() {
  const data = await fetchFlask<DashboardData>("/api/dashboard/")

  if (data) {
    return NextResponse.json({ ...data, source: "flask" })
  }

  // Flask unavailable - return seed data with a flag
  return NextResponse.json({ ...seedDashboard, source: "fallback" })
}
