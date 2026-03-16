"use client"

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye, CheckCircle, XCircle, Search, Loader2 } from "lucide-react"
import type { Violation, ViolationType, ViolationStatus } from "@/lib/types"

interface ViolationsTableProps {
  violations: Violation[] | undefined
  isLoading: boolean
  onStatusChange?: (id: string, status: ViolationStatus) => void
}

const typeLabels: Record<ViolationType, string> = {
  speeding: "Speeding",
  red_light: "Red Light",
  wrong_lane: "Wrong Lane",
  no_helmet: "No Helmet",
  no_seatbelt: "No Seatbelt",
}

const statusStyles: Record<ViolationStatus, string> = {
  pending: "border-[color:var(--warning)] bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  confirmed: "border-destructive bg-destructive/10 text-destructive",
  dismissed: "border-muted-foreground bg-muted text-muted-foreground",
}

const typeStyles: Record<ViolationType, string> = {
  speeding: "border-destructive bg-destructive/10 text-destructive",
  red_light: "border-destructive bg-destructive/10 text-destructive",
  wrong_lane: "border-[color:var(--warning)] bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  no_helmet: "border-primary bg-primary/10 text-primary",
  no_seatbelt: "border-primary bg-primary/10 text-primary",
}

export function ViolationsTable({ violations, isLoading, onStatusChange }: ViolationsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = (violations ?? []).filter((v) => {
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleConfirm = useCallback(
    (id: string) => onStatusChange?.(id, "confirmed"),
    [onStatusChange]
  )

  const handleDismiss = useCallback(
    (id: string) => onStatusChange?.(id, "dismissed"),
    [onStatusChange]
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-foreground">
            Violations Log
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plate or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] bg-secondary pl-8 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading violations from API</span>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">License Plate</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Speed</TableHead>
                  <TableHead className="text-muted-foreground">Camera</TableHead>
                  <TableHead className="text-muted-foreground">Confidence</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{v.id}</TableCell>
                    <TableCell className="font-mono font-semibold text-foreground">{v.plate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeStyles[v.type] ?? ""}>
                        {typeLabels[v.type] ?? v.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {v.speed ? `${v.speed} / ${v.limit} km/h` : "---"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.camera}</TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${v.confidence >= 0.9 ? "text-[color:var(--success)]" : v.confidence >= 0.8 ? "text-[color:var(--warning)]" : "text-destructive"}`}>
                        {(v.confidence * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[v.status] ?? ""}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{v.time}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">View details</span>
                        </Button>
                        {v.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[color:var(--success)] hover:text-[color:var(--success)]"
                              onClick={() => handleConfirm(v.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="sr-only">Confirm violation</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDismiss(v.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="sr-only">Dismiss violation</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {(violations ?? []).length} violations</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="text-foreground">
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
