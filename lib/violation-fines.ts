import type { ViolationType } from "./types"

export const violationFines: Record<ViolationType, number> = {
  speeding: 1000,
  red_light: 1500,
  wrong_lane: 500,
  no_helmet: 1000,
  no_seatbelt: 1000,
}

export const violationLabels: Record<ViolationType, string> = {
  speeding: "Speeding",
  red_light: "Red Light Violation",
  wrong_lane: "Wrong Lane Change",
  no_helmet: "No Helmet",
  no_seatbelt: "No Seatbelt",
}

export function getFineAmount(type: ViolationType): number {
  return violationFines[type] ?? 500
}

export function getViolationLabel(type: ViolationType): string {
  return violationLabels[type] ?? "Unknown Violation"
}
