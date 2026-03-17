"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ViolationsTable } from "@/components/dashboard/violations-table"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { ArchitectureView } from "@/components/dashboard/architecture-view"
import { ChallanPanel } from "@/components/dashboard/challan-panel"
import { ApiExplorer } from "@/components/dashboard/api-explorer"
import { getUser } from "@/lib/auth"
import { VideoPlayer } from "@/components/video/video-player"
import type { DashboardData, Violation, ChallanRecord, ViolationStatus } from "@/lib/types"

// SWR fetcher that returns JSON from our Next.js API routes
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DashboardResponse extends DashboardData {
  source: "flask" | "fallback"
}

interface ViolationsResponse {
  violations: Violation[]
  total: number
  source: "flask" | "fallback"
}

interface ChallansResponse {
  challans: ChallanRecord[]
  source: "flask" | "fallback"
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Check authentication and role
  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "traffic_officer") {
      router.push("/owner-dashboard")
      return
    }
  }, [router])

  // Fetch dashboard data (stats + charts) from GET /api/dashboard
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
  } = useSWR<DashboardResponse>("/api/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  // Fetch violations from GET /api/violations
  const {
    data: violationsData,
    isLoading: violationsLoading,
    mutate: mutateViolations,
  } = useSWR<ViolationsResponse>("/api/violations", fetcher, {
    refreshInterval: 15000,
  })

  // Fetch challans from GET /api/challans
  const {
    data: challansData,
    isLoading: challansLoading,
    mutate: mutateChallans,
  } = useSWR<ChallansResponse>("/api/challans", fetcher, {
    refreshInterval: 30000,
  })

  // Handle violation status change (confirm / dismiss)
  const handleViolationStatusChange = useCallback(
    async (id: string, status: ViolationStatus) => {
      // Optimistic update
      if (violationsData) {
        mutateViolations(
          {
            ...violationsData,
            violations: violationsData.violations.map((v) =>
              v.id === id ? { ...v, status } : v
            ),
          },
          false
        )
      }

      // Send to API
      await fetch("/api/violations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })

      // Revalidate
      mutateViolations()
    },
    [violationsData, mutateViolations]
  )

  // Handle challan mark as paid
  const handleMarkPaid = useCallback(
    async (challanNumber: string) => {
      // Optimistic update
      if (challansData) {
        mutateChallans(
          {
            ...challansData,
            challans: challansData.challans.map((c) =>
              c.challanNumber === challanNumber ? { ...c, status: "paid" as const } : c
            ),
          },
          false
        )
      }

      await fetch("/api/challans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challanNumber, action: "pay" }),
      })

      mutateChallans()
    },
    [challansData, mutateChallans]
  )

  // Determine data source from any of the responses
  const dataSource = dashboardData?.source ?? violationsData?.source ?? "fallback"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader dataSource={dataSource} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="challans">E-Challans</TabsTrigger>
            <TabsTrigger value="api">API Explorer</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            <VideoPlayer />
            <StatsCards
              stats={dashboardData?.stats}
              isLoading={dashboardLoading}
            />
            <AnalyticsCharts
              charts={dashboardData?.charts}
              isLoading={dashboardLoading}
            />
          </TabsContent>

          <TabsContent value="violations">
            <ViolationsTable
              violations={violationsData?.violations}
              isLoading={violationsLoading}
              onStatusChange={handleViolationStatusChange}
            />
          </TabsContent>

          <TabsContent value="challans">
            <ChallanPanel
              challans={challansData?.challans}
              isLoading={challansLoading}
              onMarkPaid={handleMarkPaid}
            />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureView />
          </TabsContent>

          <TabsContent value="api">
            <ApiExplorer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
