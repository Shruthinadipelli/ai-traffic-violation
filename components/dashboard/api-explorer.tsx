"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Terminal,
  Database,
  Server,
  Globe,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────
interface EndpointDef {
  method: string
  path: string
  description: string
  flaskPath: string
  group: "dashboard" | "violations" | "challans"
}

interface ApiResult {
  status: number
  source: string
  data: unknown
  time: number
}

// ── Endpoint definitions ──────────────────────────────
const endpoints: EndpointDef[] = [
  {
    method: "GET",
    path: "/api/dashboard",
    description: "Unified dashboard payload: stats, violations, challans, and chart data.",
    flaskPath: "GET /api/dashboard/",
    group: "dashboard",
  },
  {
    method: "GET",
    path: "/api/violations",
    description: "All violations with auto-filtering. Supports ?status= and ?search= query params.",
    flaskPath: "GET /api/violations/",
    group: "violations",
  },
  {
    method: "GET",
    path: "/api/violations?status=pending",
    description: "Filtered violations showing only pending items.",
    flaskPath: "GET /api/violations/?status=pending",
    group: "violations",
  },
  {
    method: "GET",
    path: "/api/violations?search=MH12",
    description: "Search violations by license plate or ID.",
    flaskPath: "GET /api/violations/?search=MH12",
    group: "violations",
  },
  {
    method: "GET",
    path: "/api/challans",
    description: "All e-challan records with fine amounts and payment status.",
    flaskPath: "GET /api/challans/",
    group: "challans",
  },
]

const groupLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  dashboard: { label: "Dashboard", icon: <Globe className="h-4 w-4" /> },
  violations: { label: "Violations", icon: <Database className="h-4 w-4" /> },
  challans: { label: "Challans", icon: <Server className="h-4 w-4" /> },
}

// ── Helpers ───────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : method === "PATCH"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-blue-500/15 text-blue-400 border-blue-500/30"

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-bold border ${color}`}
    >
      {method}
    </span>
  )
}

// ── Main Component ────────────────────────────────────
export function ApiExplorer() {
  const [results, setResults] = useState<Record<string, ApiResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const callEndpoint = useCallback(async (endpoint: EndpointDef) => {
    const key = endpoint.path
    setLoading((prev) => ({ ...prev, [key]: true }))

    const start = performance.now()
    try {
      const res = await fetch(endpoint.path)
      const data = await res.json()
      const time = Math.round(performance.now() - start)

      setResults((prev) => ({
        ...prev,
        [key]: {
          status: res.status,
          source: data.source ?? "unknown",
          data,
          time,
        },
      }))
    } catch (err) {
      const time = Math.round(performance.now() - start)
      setResults((prev) => ({
        ...prev,
        [key]: {
          status: 0,
          source: "error",
          data: { error: String(err) },
          time,
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }))
    }
  }, [])

  const callAll = useCallback(async () => {
    for (const ep of endpoints) {
      await callEndpoint(ep)
    }
  }, [callEndpoint])

  const copyJson = useCallback((key: string) => {
    const result = results[key]
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [results])

  const groups = ["dashboard", "violations", "challans"] as const

  return (
    <div className="flex flex-col gap-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">API Explorer</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Test every backend endpoint live. Each route proxies to Flask and falls back to seed data.
                </CardDescription>
              </div>
            </div>
            <Button onClick={callAll} className="gap-2">
              <Play className="h-4 w-4" />
              Run All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Flask Setup Guide */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-foreground">How to Run the Flask Backend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary p-4 font-mono text-sm text-foreground leading-relaxed">
            <div className="text-muted-foreground"># 1. Navigate to the backend folder</div>
            <div>cd backend</div>
            <div className="mt-2 text-muted-foreground"># 2. Create a virtual environment</div>
            <div>python -m venv venv && source venv/bin/activate</div>
            <div className="mt-2 text-muted-foreground"># 3. Install dependencies</div>
            <div>pip install -r requirements.txt</div>
            <div className="mt-2 text-muted-foreground"># 4. Set up MySQL (optional - uses SQLite fallback in testing mode)</div>
            <div>export FLASK_ENV=testing  <span className="text-muted-foreground"># uses SQLite, no MySQL needed</span></div>
            <div className="mt-2 text-muted-foreground"># 5. Start the Flask server</div>
            <div>python app.py</div>
            <div className="mt-3 text-muted-foreground"># Flask will run on http://localhost:5000</div>
            <div className="text-muted-foreground"># The Next.js API routes will auto-detect it and switch from "Fallback" to "Flask API"</div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Groups */}
      {groups.map((group) => {
        const groupEndpoints = endpoints.filter((ep) => ep.group === group)
        const { label, icon } = groupLabels[group]

        return (
          <Card key={group} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-sm text-foreground">{label} Endpoints</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {groupEndpoints.map((ep) => {
                const key = ep.path
                const result = results[key]
                const isLoading = loading[key]

                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-secondary/50 p-4"
                  >
                    {/* Endpoint header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <MethodBadge method={ep.method} />
                          <code className="text-sm font-mono text-foreground break-all">{ep.path}</code>
                        </div>
                        <p className="text-xs text-muted-foreground">{ep.description}</p>
                        <p className="text-xs text-muted-foreground/60">
                          Flask: <code className="text-muted-foreground">{ep.flaskPath}</code>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callEndpoint(ep)}
                        disabled={isLoading}
                        className="shrink-0 gap-1.5"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Send
                      </Button>
                    </div>

                    {/* Result */}
                    {result && (
                      <div className="mt-3 flex flex-col gap-2">
                        {/* Status bar */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            {result.status >= 200 && result.status < 300 ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-destructive" />
                            )}
                            <span className="font-mono text-foreground">{result.status}</span>
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              result.source === "flask"
                                ? "border-emerald-500/30 text-emerald-400 text-[10px]"
                                : result.source === "fallback"
                                  ? "border-amber-500/30 text-amber-400 text-[10px]"
                                  : "border-destructive/30 text-destructive text-[10px]"
                            }
                          >
                            {result.source === "flask"
                              ? "Flask API"
                              : result.source === "fallback"
                                ? "Fallback Data"
                                : "Error"}
                          </Badge>
                          <span className="text-muted-foreground">{result.time}ms</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-6 px-2 text-[10px] gap-1 text-muted-foreground"
                            onClick={() => copyJson(key)}
                          >
                            <Copy className="h-3 w-3" />
                            {copied === key ? "Copied" : "Copy"}
                          </Button>
                        </div>

                        {/* JSON output */}
                        <pre className="max-h-64 overflow-auto rounded-md bg-background p-3 text-xs font-mono text-foreground/80 border border-border">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
