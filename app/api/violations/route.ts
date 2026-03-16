// app/api/violations/route.ts
// =============================
// Proxies to Flask GET /api/violations for the violations list.
// Falls back to seed data when Flask is unreachable.
// Supports ?status= and ?search= query parameters.

import { NextResponse } from "next/server"
import { fetchFlask } from "@/lib/api-config"
import { seedViolations } from "@/lib/seed-data"
import type { Violation, ViolationStatus } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  // Try Flask backend first
  const flaskUrl = status && status !== "all"
    ? `/api/violations/?status=${status}`
    : "/api/violations/"
  const flaskData = await fetchFlask<{ violations: Violation[] }>(flaskUrl)

  let violations: Violation[]

  if (flaskData?.violations) {
    violations = flaskData.violations
  } else {
    // Fallback to seed data with local filtering
    violations = [...seedViolations]

    if (status && status !== "all") {
      violations = violations.filter((v) => v.status === (status as ViolationStatus))
    }
  }

  // Client-side search filtering (applied to both sources)
  if (search) {
    const q = search.toLowerCase()
    violations = violations.filter(
      (v) =>
        v.plate.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({
    violations,
    total: violations.length,
    source: flaskData ? "flask" : "fallback",
  })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, status } = body as { id: string; status: ViolationStatus }

  // Try Flask backend
  const numericId = parseInt(id.replace("V-", ""), 10)
  const flaskData = await fetchFlask<Violation>(
    `/api/violations/${numericId}`
  )

  if (flaskData) {
    // Send PATCH to Flask
    try {
      const res = await fetch(
        `${process.env.FLASK_API_URL || "http://localhost:5000"}/api/violations/${numericId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      )
      if (res.ok) {
        return NextResponse.json(await res.json())
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: just acknowledge the update
  return NextResponse.json({ id, status, source: "fallback" })
}
