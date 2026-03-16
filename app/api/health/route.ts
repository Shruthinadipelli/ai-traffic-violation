// app/api/health/route.ts
// ========================
// Health check endpoint that reports the status of both the Next.js layer
// and the Flask backend connectivity.

import { NextResponse } from "next/server"
import { FLASK_API_URL } from "@/lib/api-config"

export async function GET() {
  let flaskStatus: "connected" | "unreachable" = "unreachable"
  let flaskLatency = 0

  try {
    const start = performance.now()
    const res = await fetch(`${FLASK_API_URL}/api/dashboard/`, {
      signal: AbortSignal.timeout(3000),
    })
    flaskLatency = Math.round(performance.now() - start)
    if (res.ok) flaskStatus = "connected"
  } catch {
    // Flask not running
  }

  return NextResponse.json({
    nextjs: "ok",
    flask: flaskStatus,
    flaskUrl: FLASK_API_URL,
    flaskLatency: flaskStatus === "connected" ? `${flaskLatency}ms` : null,
    timestamp: new Date().toISOString(),
  })
}
