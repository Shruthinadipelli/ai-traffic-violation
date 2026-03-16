// app/api/challans/[id]/pay/route.ts
// ====================================
// PUT /api/challans/:id/pay - marks a challan as paid
// Proxies to Flask PUT /api/challans/:id/pay, falls back to returning updated seed record.

import { NextResponse } from "next/server"
import { FLASK_API_URL } from "@/lib/api-config"
import { seedChallans } from "@/lib/seed-data"

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Flask backend
  try {
    const res = await fetch(`${FLASK_API_URL}/api/challans/${id}/pay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ challan: data, source: "flask" })
    }
  } catch {
    // Flask unreachable
  }

  // Fallback: simulate marking as paid
  const challan = seedChallans.find((c) => c.challanNumber === id)
  if (!challan) {
    return NextResponse.json({ error: "Challan not found" }, { status: 404 })
  }

  return NextResponse.json({
    challan: {
      ...challan,
      status: "paid",
      paymentDate: new Date().toISOString(),
    },
    source: "fallback",
  })
}
