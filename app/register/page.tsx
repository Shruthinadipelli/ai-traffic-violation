"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [role, setRole] = useState("vehicle-owner")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Handle registration logic here
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">TrafficEye</span>
          </Link>
          <div className="text-sm text-slate-600">Traffic Violation Intelligence</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md pt-20">
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Register</h1>
          <p className="mb-8 text-slate-600">
            Create a TrafficEye account to securely view or manage traffic violations and challans.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-slate-300 bg-slate-50 h-12 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-slate-300 bg-slate-50 h-12 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-slate-300 bg-slate-50 h-12"
                required
              />
            </div>

            {/* Vehicle Number */}
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-sm font-semibold text-slate-700">
                Primary Vehicle Number (e.g. KA01AB1234) *
              </Label>
              <Input
                id="vehicle"
                placeholder="KA01AB1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="border-2 border-slate-300 bg-slate-50 h-12"
                required
              />
              <p className="text-xs text-slate-500">
                Used to link detections and challans to your account
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                Role *
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="border-2 border-slate-300 bg-slate-50 text-slate-900 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle-owner">
                    User (Vehicle Owner)
                  </SelectItem>
                  <SelectItem value="traffic-official">
                    Official (Traffic Officer)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
