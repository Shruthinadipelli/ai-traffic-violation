// app/api/challans/route.ts
// ==========================
// Proxies to Flask GET /api/challans for e-challan records.
// Falls back to seed data when Flask is unreachable.

import { NextResponse } from "next/server"
import { fetchFlask } from "@/lib/api-config"
import { seedChallans } from "@/lib/seed-data"
import type { ChallanRecord } from "@/lib/types"

export async function GET() {
  const flaskData = await fetchFlask<ChallanRecord[]>("/api/challans/")

  if (flaskData) {
    return NextResponse.json({ challans: flaskData, source: "flask" })
  }

  return NextResponse.json({ challans: seedChallans, source: "fallback" })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { challanId, action } = body as { challanId: number; action: string }

  if (action === "pay") {
    try {
      const res = await fetch(
        `${process.env.FLASK_API_URL || "http://localhost:5000"}/api/challans/${challanId}/pay`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      )
      if (res.ok) {
        return NextResponse.json(await res.json())
      }
    } catch {
      // Fall through
    }
  }

  return NextResponse.json({ challanId, action, source: "fallback" })
}
