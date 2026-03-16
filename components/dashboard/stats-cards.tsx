"use client"

import {
  AlertTriangle,
  Car,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats | undefined
  isLoading: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Violations",
      value: stats ? stats.total_violations.toLocaleString() : "---",
      change: "+12.5%",
      trend: "up" as const,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Vehicles Detected",
      value: stats ? stats.vehicles_detected.toLocaleString() : "---",
      change: "+8.1%",
      trend: "up" as const,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending Review",
      value: stats ? stats.pending_review.toLocaleString() : "---",
      change: "-3.2%",
      trend: "down" as const,
      icon: Clock,
      color: "text-[color:var(--warning)]",
      bgColor: "bg-[color:var(--warning)]/10",
    },
    {
      label: "Challans Issued",
      value: stats ? stats.challans_issued.toLocaleString() : "---",
      change: "+18.3%",
      trend: "up" as const,
      icon: CreditCard,
      color: "text-[color:var(--success)]",
      bgColor: "bg-[color:var(--success)]/10",
    },
    {
      label: "Fines Collected",
      value: stats
        ? `Rs ${(stats.fines_collected / 100000).toFixed(1)}L`
        : "---",
      change: "+22.1%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-[color:var(--success)]",
      bgColor: "bg-[color:var(--success)]/10",
    },
    {
      label: "Resolved",
      value: stats ? stats.resolved.toLocaleString() : "---",
      change: "+5.4%",
      trend: "up" as const,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p
                  className={`mt-1 text-xs ${
                    stat.trend === "up"
                      ? "text-[color:var(--success)]"
                      : "text-destructive"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
