import type { PaymentRecord } from "./types"
import { seedChallans } from "./seed-data"

const PAYMENT_STORAGE_KEY = "traffic_eye_payments"

// Initialize payment records from seed data on first load
function initializePaymentsFromSeed(): PaymentRecord[] {
  return seedChallans.map((challan) => ({
    challanNumber: challan.challanNumber,
    violationId: challan.violationId,
    plate: challan.plate,
    amount: challan.fine,
    paid_at: challan.status === "paid" ? new Date(0).toISOString() : null,
    payment_method: challan.status === "paid" ? "upi" : null,
  }))
}

export function getPayments(): PaymentRecord[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(PAYMENT_STORAGE_KEY)
  
  if (!stored) {
    // First time - initialize from seed data
    const initial = initializePaymentsFromSeed()
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  
  return JSON.parse(stored)
}

export function savePayment(payment: PaymentRecord): void {
  if (typeof window !== "undefined") {
    const payments = getPayments()
    const index = payments.findIndex((p) => p.challanNumber === payment.challanNumber)
    if (index >= 0) {
      payments[index] = payment
    } else {
      payments.push(payment)
    }
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments))
  }
}

export function markAsPaid(challanNumber: string, transactionId?: string): void {
  if (typeof window !== "undefined") {
    const payments = getPayments()
    const payment = payments.find((p) => p.challanNumber === challanNumber)
    if (payment) {
      payment.paid_at = new Date().toISOString()
      payment.payment_method = "upi"
      if (transactionId) {
        payment.upi_transaction_id = transactionId
      }
      savePayment(payment)
    }
  }
}

export function getPaymentStatus(challanNumber: string): "paid" | "unpaid" {
  const payments = getPayments()
  const payment = payments.find((p) => p.challanNumber === challanNumber)
  return payment?.paid_at ? "paid" : "unpaid"
}

export function generateUPIString(
  upiId: string,
  name: string,
  amount: number,
  transactionRef: string
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toString(),
    tn: `Traffic Challan ${transactionRef}`,
    tr: transactionRef,
  })
  return `upi://pay?${params.toString()}`
}

export function generateQRContent(upiString: string): string {
  // In a real app, we'd encode this as a QR code
  // For now, return the UPI string that can be encoded
  return upiString
}
