// app/api/challans/[id]/route.ts
// ================================
// GET /api/challans/:id - returns full challan details
// Proxies to Flask GET /api/challans/:id, falls back to seed data lookup.

import { NextResponse } from "next/server"
import { fetchFlask } from "@/lib/api-config"
import { seedChallans, seedViolations } from "@/lib/seed-data"
import type { ChallanRecord } from "@/lib/types"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Flask first
  const flaskData = await fetchFlask<ChallanRecord & { violation?: unknown }>(
    `/api/challans/${id}`
  )
  if (flaskData) {
    return NextResponse.json({ challan: flaskData, source: "flask" })
  }

  // Fallback: find in seed data
  const challan = seedChallans.find((c) => c.challanNumber === id)
  if (!challan) {
    return NextResponse.json({ error: "Challan not found" }, { status: 404 })
  }

  // Enrich with violation data from seed
  const violation = seedViolations.find((v) => v.id === challan.violationId)

  return NextResponse.json({
    challan: {
      ...challan,
      violation: violation
        ? {
            id: violation.id,
            plate: violation.plate,
            type: violation.type,
            speed: violation.speed,
            limit: violation.limit,
            camera: violation.camera,
            confidence: violation.confidence,
            time: violation.time,
          }
        : null,
      issuedDate: "2026-02-25",
      officerName: "AI Detection System",
      paymentUrl: `https://traffic.gov.in/pay/${challan.challanNumber}`,
    },
    source: "fallback",
  })
}
