"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import QRCode from "qrcode.react"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth"
import { seedViolations, seedChallans } from "@/lib/seed-data"
import { getFineAmount, getViolationLabel } from "@/lib/violation-fines"
import { getPaymentStatus, markAsPaid } from "@/lib/payment"
import type { User, Violation } from "@/lib/types"

export default function ChallanPage() {
  const router = useRouter()
  const params = useParams()
  const violationId = params.violation_id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [violation, setViolation] = useState<Violation | null>(null)
  const [marking, setMarking] = useState(false)

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

    // Find violation
    const found = seedViolations.find((v) => v.id === violationId && v.plate === currentUser.vehicle_number)
    if (!found) {
      router.push("/owner-dashboard")
      return
    }
    setViolation(found)
  }, [violationId, router])

  if (!user || !violation) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const challan = seedChallans.find((c) => c.violationId === violation.id)
  const fine = challan?.fine || getFineAmount(violation.type)
  const paymentStatus = challan ? getPaymentStatus(challan.challanNumber) : "unpaid"
  const upiString = `upi://pay?pa=traffic@upi&pn=TrafficEye&am=${fine}&cu=INR`

  const handleConfirmPayment = async () => {
    if (!challan) return
    setMarking(true)
    try {
      markAsPaid(challan.challanNumber, `TXN-${Date.now()}`)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("[v0] Error marking as paid:", error)
      setMarking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/owner-dashboard" className="flex items-center gap-3 hover:opacity-80">
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Digital Challan</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {/* Challan Card */}
        <div className="rounded-lg bg-white shadow-md border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold opacity-90">Digital Challan</p>
                <h2 className="text-3xl font-bold mt-2">Challan #{challan?.challanNumber || "N/A"}</h2>
              </div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                  paymentStatus === "paid"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {paymentStatus === "paid" ? "Paid" : "Not Paid"}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-8">
            {/* Vehicle & Violation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Vehicle Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600">Vehicle Number</span>
                    <span className="font-semibold text-slate-900">{violation.plate}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600">Owner</span>
                    <span className="font-semibold text-slate-900">{user.name}</span>
                  </div>
                </div>
              </div>

              {/* Violation Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Violation Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600">Violation Type</span>
                    <span className="font-semibold text-slate-900">{getViolationLabel(violation.type)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-600">Date & Time</span>
                    <span className="font-semibold text-slate-900">{violation.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Camera Location</span>
                    <span className="font-semibold text-slate-900">{violation.camera}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fine Amount */}
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-6 border border-blue-200">
              <p className="text-sm font-semibold text-slate-600">Total Fine Amount</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">₹{fine}</p>
              {challan && (
                <p className="text-xs text-slate-500 mt-2">
                  Due Date: {challan.dueDate}
                </p>
              )}
            </div>

            {/* Additional Violation Details */}
            {violation.speed && (
              <div className="rounded-lg bg-slate-50 p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Speed Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Speed Recorded</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{violation.speed} km/h</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Speed Limit</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{violation.limit} km/h</p>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Payment Section */}
            {paymentStatus === "unpaid" && (
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-slate-50 p-6 border border-emerald-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pay Fine Online</h3>
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="rounded-lg bg-white p-6 border-2 border-slate-300 mb-4">
                      <QRCode
                        value={upiString}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-sm text-slate-600 text-center">
                      Scan with any UPI app to pay ₹{fine}
                    </p>
                  </div>

                  {/* UPI Details */}
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm border border-slate-200">
                    <p>
                      <span className="font-semibold text-slate-700">UPI ID:</span> traffic@upi
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Beneficiary:</span> TrafficEye
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Amount:</span> ₹{fine}
                    </p>
                  </div>

                  {/* Confirm Payment Button */}
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={marking}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 h-auto"
                  >
                    {marking ? "Processing..." : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Completed Message */}
            {paymentStatus === "paid" && (
              <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-slate-50 p-6 border border-emerald-200">
                <div className="flex items-center gap-4">
                  <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-lg font-bold text-emerald-900">Payment Completed</p>
                    <p className="text-sm text-emerald-700">Thank you! Your fine has been paid.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link href="/owner-dashboard">
            <Button variant="outline" className="text-slate-700 border-slate-300 hover:bg-slate-50">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
