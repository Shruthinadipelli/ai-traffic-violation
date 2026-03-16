"use client"

import { Shield, Bell, Settings, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  dataSource?: "flask" | "fallback"
}

export function DashboardHeader({ dataSource }: DashboardHeaderProps) {
  const isFlask = dataSource === "flask"

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight text-foreground font-sans">
            TrafficAI
          </h1>
          <p className="text-xs text-muted-foreground">
            Violation Detection System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Data source indicator */}
        <Badge
          variant="outline"
          className={
            isFlask
              ? "border-[color:var(--success)] bg-[color:var(--success)]/10 text-[color:var(--success)] text-xs"
              : "border-[color:var(--warning)] bg-[color:var(--warning)]/10 text-[color:var(--warning)] text-xs"
          }
        >
          <Database className="mr-1 h-3 w-3" />
          {isFlask ? "Flask API" : "Fallback Data"}
        </Badge>

        <Badge
          variant="outline"
          className="border-[color:var(--success)] bg-[color:var(--success)]/10 text-[color:var(--success)] text-xs"
        >
          System Online
        </Badge>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  )
}
