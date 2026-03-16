"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUser, clearUser } from "@/lib/auth"
import { seedViolations, seedChallans } from "@/lib/seed-data"
import { getFineAmount, getViolationLabel } from "@/lib/violation-fines"
import { getPaymentStatus } from "@/lib/payment"
import type { User, Violation } from "@/lib/types"
import { PaymentModal } from "@/components/owner/payment-modal"

export default function OwnerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myViolations, setMyViolations] = useState<Violation[]>([])
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    if (currentUser.role !== "vehicle_owner") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)

    // Filter violations by vehicle number
    const filtered = seedViolations.filter(
      (v) => v.plate === currentUser.vehicle_number
    )
    setMyViolations(filtered)
  }, [router])

  const handleLogout = () => {
    clearUser()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const unpaidViolations = myViolations.filter(
    (v) => getPaymentStatus(seedChallans.find((c) => c.violationId === v.id)?.challanNumber || "") === "unpaid"
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">TrafficEye</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.vehicle_number}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-slate-600 hover:bg-slate-100"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">My Violations</h2>
          <p className="mt-2 text-slate-600">
            View and manage your traffic violations and digital challans
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Total Violations</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{myViolations.length}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Unpaid Challans</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{unpaidViolations.length}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Total Outstanding</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{unpaidViolations.reduce((sum, v) => sum + getFineAmount(v.type), 0)}
            </p>
          </div>
        </div>

        {/* Violations List */}
        {myViolations.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-slate-200">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">No violations found</h3>
            <p className="mt-2 text-slate-600">Great! No traffic violations detected for your vehicle.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myViolations.map((violation) => {
              const challan = seedChallans.find((c) => c.violationId === violation.id)
              const fine = challan?.fine || getFineAmount(violation.type)
              const paymentStatus = challan ? getPaymentStatus(challan.challanNumber) : "unpaid"

              return (
                <div
                  key={violation.id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  {/* Card Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <svg className="h-16 w-16 text-white opacity-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Header with Status Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {violation.plate}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {getViolationLabel(violation.type)}
                        </p>
                      </div>
                      <span
                        className={`ml-2 shrink-0 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                          paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {paymentStatus === "paid" ? "Paid" : "Not Paid"}
                      </span>
                    </div>

                    {/* Fine Amount */}
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold">Fine Amount</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">₹{fine}</p>
                    </div>

                    {/* Violation Details */}
                    <div className="space-y-2 mb-4 text-xs text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-700">Camera:</span> {violation.camera}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Time:</span> {violation.time}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Confidence:</span> {(violation.confidence * 100).toFixed(0)}%
                      </p>
                      {violation.speed && (
                        <p>
                          <span className="font-semibold text-slate-700">Speed:</span> {violation.speed} km/h (Limit: {violation.limit} km/h)
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    {paymentStatus === "unpaid" && challan && (
                      <Button
                        onClick={() => setSelectedViolation(violation.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 h-auto"
                      >
                        Pay Fine
                      </Button>
                    )}
                    {paymentStatus === "paid" && (
                      <div className="w-full py-2 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-200">
                        Payment Completed
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {selectedViolation && (
        <PaymentModal
          violation={myViolations.find((v) => v.id === selectedViolation)}
          challan={seedChallans.find((c) => c.violationId === selectedViolation)}
          onClose={() => setSelectedViolation(null)}
        />
      )}
    </div>
  )
}
