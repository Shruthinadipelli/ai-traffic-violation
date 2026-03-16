"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">TrafficEye</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Register
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="flex flex-col justify-center gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight text-balance">
                <span className="block">TrafficEye</span>
              </h2>
              <p className="text-xl leading-relaxed text-slate-300">
                AI-powered traffic violation detection & digital challan management for smarter, safer cities.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button className="h-12 px-8 text-lg font-semibold bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800">
                  VIEW VIOLATIONS DASHBOARD
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-12 px-8 text-lg font-semibold border-2 border-blue-400 text-white hover:bg-blue-500/10">
                  GET STARTED
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-400">24/7</p>
                <p className="text-sm text-slate-300">Camera monitoring</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-400">Real-time</p>
                <p className="text-sm text-slate-300">YOLO8 detection</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-400">Secure</p>
                <p className="text-sm text-slate-300">JWT-based access</p>
              </div>
            </div>
          </div>

          {/* Right Content - Cards */}
          <div className="flex flex-col gap-6">
            {/* Live Camera Card */}
            <div className="overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-slate-900/50 p-6 backdrop-blur-sm">
              <p className="mb-4 text-sm font-semibold text-blue-300">Live camera snapshot</p>
              <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-blue-400/20 to-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop"
                  alt="Traffic camera view"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-400">Violation detected: Speed limit exceeded</p>
                <span className="rounded bg-red-600/30 px-3 py-1 text-red-300 font-semibold">Fine: ₹1000</span>
              </div>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold text-blue-300 mb-2">For Officials</p>
                <p className="text-xs text-slate-300">Manage violations and e-challans</p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold text-blue-300 mb-2">For Vehicle Owners</p>
                <p className="text-xs text-slate-300">View and pay challans</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
