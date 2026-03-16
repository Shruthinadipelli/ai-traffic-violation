// lib/api-config.ts
// ==================
// Central configuration for Flask backend connectivity.
// The frontend Next.js API routes proxy requests to this URL.

export const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000"

/**
 * Try to fetch from the Flask backend.
 * Returns the JSON data on success, or null if the backend is unreachable.
 */
export async function fetchFlask<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${FLASK_API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000), // 3s timeout
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Flask server is not running - caller should use fallback data
    return null
  }
}
