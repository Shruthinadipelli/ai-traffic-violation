"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { markAsPaid } from "@/lib/payment"
import { generateUPIString } from "@/lib/payment"
import type { Violation, ChallanRecord } from "@/lib/types"

interface PaymentModalProps {
  violation: Violation | undefined
  challan: ChallanRecord | undefined
  onClose: () => void
}

export function PaymentModal({ violation, challan, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "bank">("upi")
  const [marking, setMarking] = useState(false)

  if (!violation || !challan) return null

  const handleMarkAsPaid = async () => {
    setMarking(true)
    try {
      // Mark as paid in localStorage
      markAsPaid(challan.challanNumber, `TXN-${Date.now()}`)
      
      // Close modal and trigger refresh
      setTimeout(() => {
        onClose()
        // Refresh the page to show updated status
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("[v0] Error marking as paid:", error)
      setMarking(false)
    }
  }

  // Generate UPI string
  const upiString = generateUPIString(
    "trafficviolation@hdfc",
    "Traffic Violation Payment",
    challan.fine,
    challan.challanNumber
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">Payment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Challan #{challan.challanNumber}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Amount Display */}
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-6 text-center border border-blue-200">
            <p className="text-sm font-semibold text-slate-600">Amount to Pay</p>
            <p className="mt-2 text-4xl font-bold text-blue-600">₹{challan.fine}</p>
            <p className="mt-2 text-sm text-slate-600">
              Due: {challan.dueDate}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Select Payment Method</p>
            <div className="space-y-2">
              {/* UPI Option */}
              <label className="flex items-center gap-3 rounded-lg border-2 border-slate-300 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setPaymentMethod("upi")}>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">UPI</p>
                  <p className="text-xs text-slate-600">Google Pay, PhonePe, BHIM, etc.</p>
                </div>
              </label>

              {/* Card Option */}
              <label className="flex items-center gap-3 rounded-lg border-2 border-slate-300 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setPaymentMethod("card")}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Credit/Debit Card</p>
                  <p className="text-xs text-slate-600">Visa, Mastercard, Rupay</p>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label className="flex items-center gap-3 rounded-lg border-2 border-slate-300 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setPaymentMethod("bank")}>
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Bank Transfer</p>
                  <p className="text-xs text-slate-600">Direct bank transfer</p>
                </div>
              </label>
            </div>
          </div>

          {/* UPI QR Code */}
          {paymentMethod === "upi" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Scan with UPI App</p>
              <div className="rounded-lg bg-slate-100 p-6 flex items-center justify-center aspect-square border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <svg className="mx-auto mb-2 h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs text-slate-600">
                    QR Code: {upiString.substring(0, 20)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card Details */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Bank Details */}
          {paymentMethod === "bank" && (
            <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-700">Bank:</span> HDFC Bank
              </p>
              <p>
                <span className="font-semibold text-slate-700">Account:</span> 1234567890
              </p>
              <p>
                <span className="font-semibold text-slate-700">IFSC:</span> HDFC0001234
              </p>
              <p>
                <span className="font-semibold text-slate-700">Reference:</span> {challan.challanNumber}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMarkAsPaid}
            disabled={marking}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
          >
            {marking ? "Processing..." : "Mark as Paid"}
          </Button>
        </div>
      </div>
    </div>
  )
}
