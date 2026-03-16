"use client"

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
import { QrCode, CreditCard, ExternalLink, Loader2 } from "lucide-react"
import type { ChallanRecord } from "@/lib/types"

interface ChallanPanelProps {
  challans: ChallanRecord[] | undefined
  isLoading: boolean
  onMarkPaid?: (challanNumber: string) => void
}

const statusStyles: Record<string, string> = {
  paid: "border-[color:var(--success)] bg-[color:var(--success)]/10 text-[color:var(--success)]",
  unpaid: "border-[color:var(--warning)] bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  overdue: "border-destructive bg-destructive/10 text-destructive",
}

export function ChallanPanel({ challans, isLoading, onMarkPaid }: ChallanPanelProps) {
  const records = challans ?? []
  const totalFines = records.reduce((sum, c) => sum + c.fine, 0)
  const collected = records.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.fine, 0)
  const pendingCount = records.filter((c) => c.status !== "paid").length

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Fines Issued</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-foreground">Rs {totalFines.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-[color:var(--success)]">Rs {collected.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pending Challans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-[color:var(--warning)]">{pendingCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Challans table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">E-Challan Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading challans from API</span>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Challan No.</TableHead>
                  <TableHead className="text-muted-foreground">Violation</TableHead>
                  <TableHead className="text-muted-foreground">Plate</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Fine</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((c) => (
                  <TableRow key={c.challanNumber} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-mono text-xs text-primary">{c.challanNumber}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.violationId}</TableCell>
                    <TableCell className="font-mono font-semibold text-foreground">{c.plate}</TableCell>
                    <TableCell className="text-muted-foreground">{c.type}</TableCell>
                    <TableCell className="font-semibold text-foreground">Rs {c.fine.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[c.status] ?? ""}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="View QR Code">
                          <QrCode className="h-3.5 w-3.5" />
                          <span className="sr-only">View QR code</span>
                        </Button>
                        {c.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[color:var(--success)] hover:text-[color:var(--success)]"
                            title="Mark as Paid"
                            onClick={() => onMarkPaid?.(c.challanNumber)}
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span className="sr-only">Mark as paid</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Open Challan Link">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="sr-only">Open challan link</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
