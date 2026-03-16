"use client"

import { useState } from "react"
import QRCode from "qrcode.react"
import { Button } from "@/components/ui/button"
import { markAsPaid } from "@/lib/payment"
import type { Violation, ChallanRecord } from "@/lib/types"

interface PaymentModalProps {
  violation: Violation | undefined
  challan: ChallanRecord | undefined
  onClose: () => void
}

export function PaymentModal({ violation, challan, onClose }: PaymentModalProps) {
  const [marking, setMarking] = useState(false)

  if (!violation || !challan) return null

  const handleConfirmPayment = async () => {
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

  // Generate UPI string in the correct format: upi://pay?pa=traffic@upi&pn=TrafficEye&am=<fine_amount>&cu=INR
  const upiString = `upi://pay?pa=traffic@upi&pn=TrafficEye&am=${challan.fine}&cu=INR`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">Pay Traffic Fine</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* Amount Display */}
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-6 text-center border border-blue-200">
            <p className="text-sm font-semibold text-slate-600">Amount to Pay</p>
            <p className="mt-2 text-4xl font-bold text-blue-600">₹{challan.fine}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg bg-white p-4 border-2 border-slate-300">
              <QRCode
                value={upiString}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-slate-600 text-center">
              Scan this QR using any UPI app to pay ₹{challan.fine}
            </p>
          </div>

          {/* UPI Details */}
          <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-700">UPI ID:</span> traffic@upi
            </p>
            <p>
              <span className="font-semibold text-slate-700">Beneficiary:</span> TrafficEye
            </p>
            <p>
              <span className="font-semibold text-slate-700">Amount:</span> ₹{challan.fine}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Close
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={marking}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
          >
            {marking ? "Processing..." : "Confirm Payment"}
          </Button>
        </div>
      </div>
    </div>
  )
}
