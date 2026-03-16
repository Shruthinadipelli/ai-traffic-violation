// app/api/challans/[id]/qr/route.ts
// ===================================
// GET /api/challans/:id/qr - returns a QR code image URL for the challan
// Proxies to Flask GET /api/challans/:id/qr. Falls back to a dynamically
// generated QR code using a public QR API as placeholder.

import { NextResponse } from "next/server"
import { FLASK_API_URL } from "@/lib/api-config"
import { seedChallans } from "@/lib/seed-data"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Flask backend
  try {
    const res = await fetch(`${FLASK_API_URL}/api/challans/${id}/qr`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ qrUrl: data.qr_url, source: "flask" })
    }
  } catch {
    // Flask unreachable
  }

  // Fallback: verify challan exists, return a QR code pointing to payment URL
  const challan = seedChallans.find((c) => c.challanNumber === id)
  if (!challan) {
    return NextResponse.json({ error: "Challan not found" }, { status: 404 })
  }

  const paymentUrl = `https://traffic.gov.in/pay/${challan.challanNumber}`
  // Use the public QR code generation API for the fallback
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentUrl)}`

  return NextResponse.json({
    qrUrl,
    paymentUrl,
    challanNumber: challan.challanNumber,
    source: "fallback",
  })
}
