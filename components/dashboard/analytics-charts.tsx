"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { ChartData } from "@/lib/types"

interface AnalyticsChartsProps {
  charts: ChartData | undefined
  isLoading: boolean
}

const PIE_COLORS = [
  "oklch(0.65 0.19 250)",
  "oklch(0.75 0.17 160)",
  "oklch(0.55 0.22 25)",
  "oklch(0.75 0.15 80)",
  "oklch(0.60 0.20 300)",
]

const tooltipStyle = {
  backgroundColor: "oklch(0.17 0.015 260)",
  border: "1px solid oklch(0.25 0.015 260)",
  borderRadius: "6px",
  color: "oklch(0.93 0.005 260)",
  fontSize: "12px",
}

function ChartLoader() {
  return (
    <div className="flex h-[260px] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading chart data</span>
      </div>
    </div>
  )
}

export function AnalyticsCharts({ charts, isLoading }: AnalyticsChartsProps) {
  const timelineData = charts?.timeline ?? []
  const byTypeData = charts?.by_type ?? []
  const cameraData = charts?.by_camera ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Violations Timeline */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Violations Timeline (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartLoader />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
                <XAxis
                  dataKey="date"
                  stroke="oklch(0.60 0.01 260)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.60 0.01 260)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="oklch(0.65 0.19 250)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "oklch(0.65 0.19 250)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Violations by Type */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Violations by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartLoader />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="oklch(0.60 0.01 260)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  stroke="oklch(0.60 0.01 260)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="oklch(0.65 0.19 250)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Camera Distribution */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Detections by Camera Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartLoader />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={cameraData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="oklch(0.17 0.015 260)"
                  >
                    {cameraData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                {cameraData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
