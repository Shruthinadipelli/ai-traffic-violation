"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Database,
  Server,
  Brain,
  Eye,
  ScanLine,
  Gauge,
  QrCode,
  MonitorDot,
  FolderTree,
  FileCode,
  ArrowRight,
} from "lucide-react"

/* ──────────────────────────────────────────────
   Full project tree with per-file explanations
   ────────────────────────────────────────────── */

interface TreeNode {
  name: string
  purpose: string
  children?: TreeNode[]
}

const projectTree: TreeNode[] = [
  {
    name: "backend/",
    purpose: "Python Flask API server - all server-side logic lives here",
    children: [
      { name: "app.py", purpose: "Flask application factory. Initialises extensions, registers blueprints, creates DB tables on startup." },
      { name: "config.py", purpose: "Central configuration (DB URI, YOLO params, speed limits, file paths). Supports dev/test/prod environments." },
      { name: "models.py", purpose: "SQLAlchemy ORM models: Camera, Vehicle, Violation, Challan. Defines all MySQL table schemas and relationships." },
      { name: "requirements.txt", purpose: "Python dependencies: Flask, YOLO (ultralytics), EasyOCR, OpenCV, qrcode, PyMySQL." },
      {
        name: "routes/",
        purpose: "Flask Blueprints - each file handles one API domain",
        children: [
          { name: "violations.py", purpose: "CRUD endpoints for violations: list (paginated/filtered), get, create, update status, delete." },
          { name: "challans.py", purpose: "E-challan generation & management: create with QR code, list, lookup by number, mark paid." },
          { name: "analytics.py", purpose: "Dashboard data: summary KPIs, violations-by-type, violations-by-camera, 30-day timeline." },
          { name: "detection.py", purpose: "Accepts image frames, runs YOLO + OCR + speed calc pipeline, auto-creates violations." },
        ],
      },
      {
        name: "services/",
        purpose: "Core business logic modules (AI + utilities)",
        children: [
          { name: "vehicle_detector.py", purpose: "Wraps YOLOv8 to detect cars, trucks, motorcycles, buses. Returns bounding boxes + confidence." },
          { name: "plate_recognizer.py", purpose: "EasyOCR pipeline: crop, grayscale, threshold, OCR, clean. Extracts license plate text." },
          { name: "speed_calculator.py", purpose: "Tracks vehicle centroids across frames. Computes pixel displacement -> real speed (km/h)." },
          { name: "qr_generator.py", purpose: "Generates QR code PNGs encoding challan payment URLs. Saved to static/qrcodes/." },
        ],
      },
      {
        name: "ai_modules/",
        purpose: "AI model weights and utilities",
        children: [
          { name: "models/", purpose: "Directory for YOLO .pt weight files (yolov8n.pt, yolov8s.pt, etc.)." },
        ],
      },
      {
        name: "database/",
        purpose: "SQL scripts for MySQL setup",
        children: [
          { name: "schema.sql", purpose: "CREATE TABLE statements for cameras, vehicles, violations, challans with proper indexes and FKs." },
          { name: "seed.sql", purpose: "Sample data: 5 cameras, 5 vehicles, 7 violations, 4 challans for development." },
        ],
      },
    ],
  },
  {
    name: "app/",
    purpose: "Next.js React dashboard frontend (this live preview)",
    children: [
      { name: "page.tsx", purpose: "Main dashboard page with SWR data fetching from API routes. Passes live data as props to all child components." },
      { name: "layout.tsx", purpose: "Root layout with Geist fonts, metadata, and global styles." },
      { name: "globals.css", purpose: "Custom dark theme with navy/slate palette, semantic design tokens for the dashboard." },
      {
        name: "api/",
        purpose: "Next.js API proxy routes - forward requests to Flask or serve fallback seed data",
        children: [
          { name: "dashboard/route.ts", purpose: "GET /api/dashboard - proxies to Flask /api/dashboard for stats + charts + violations + challans. Returns seed data if Flask is down." },
          { name: "violations/route.ts", purpose: "GET /api/violations - proxies to Flask with ?status= and ?search= filters. PATCH to update violation status." },
          { name: "challans/route.ts", purpose: "GET /api/challans - proxies to Flask for e-challan list. PATCH to mark a challan as paid." },
        ],
      },
    ],
  },
  {
    name: "lib/",
    purpose: "Shared utilities, types, and configuration",
    children: [
      { name: "types.ts", purpose: "Shared TypeScript interfaces: Violation, ChallanRecord, DashboardStats, ChartData, DashboardData." },
      { name: "api-config.ts", purpose: "Flask API URL config and fetchFlask() helper with 3s timeout. Used by Next.js API routes to proxy requests." },
      { name: "seed-data.ts", purpose: "Fallback seed data mirroring MySQL seed.sql. Used when Flask backend is unreachable." },
      { name: "utils.ts", purpose: "cn() utility for merging Tailwind CSS class names." },
    ],
  },
  {
    name: "components/dashboard/",
    purpose: "React components for the admin dashboard",
    children: [
      { name: "dashboard-header.tsx", purpose: "Sticky top bar with TrafficAI branding, data source indicator (Flask API vs Fallback), and system status badge." },
      { name: "stats-cards.tsx", purpose: "6 KPI cards receiving stats via props from SWR. Shows loading spinners while fetching." },
      { name: "violations-table.tsx", purpose: "Violations log table with props-driven data, search, filter, and optimistic confirm/dismiss via PATCH /api/violations." },
      { name: "analytics-charts.tsx", purpose: "Recharts visualisations receiving chart data via props. Renders loading placeholders while SWR fetches." },
      { name: "challan-panel.tsx", purpose: "E-challan management with props-driven data. Mark-as-paid triggers PATCH /api/challans with optimistic updates." },
      { name: "architecture-view.tsx", purpose: "This page - interactive project structure explorer with file explanations." },
    ],
  },
]

/* ──────────────────────────────────────────────
   System architecture pipeline stages
   ────────────────────────────────────────────── */

const pipelineStages = [
  {
    icon: MonitorDot,
    title: "Camera Feed",
    desc: "Traffic cameras stream video frames to the Flask API",
    tech: "RTSP / HTTP Upload",
  },
  {
    icon: Eye,
    title: "YOLO Detection",
    desc: "YOLOv8 identifies vehicles (car, truck, motorcycle, bus) with bounding boxes",
    tech: "ultralytics / PyTorch",
  },
  {
    icon: ScanLine,
    title: "OCR Plate Read",
    desc: "EasyOCR extracts license plate text from the detected vehicle region",
    tech: "EasyOCR / OpenCV",
  },
  {
    icon: Gauge,
    title: "Speed Estimation",
    desc: "Centroid tracking across frames calculates real-world vehicle speed",
    tech: "Custom Algorithm",
  },
  {
    icon: Database,
    title: "MySQL Storage",
    desc: "Violations, vehicles, and challans are persisted in a relational database",
    tech: "MySQL / SQLAlchemy",
  },
  {
    icon: QrCode,
    title: "E-Challan + QR",
    desc: "Challans are generated with QR codes linking to payment portals",
    tech: "qrcode / Pillow",
  },
]

/* ──────────────────────────────────────────────
   Tree renderer component
   ────────────────────────────────────────────── */

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const isDir = !!node.children
  return (
    <div style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="group flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-secondary/50">
        {isDir ? (
          <FolderTree className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        ) : (
          <FileCode className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <span className={`font-mono text-sm ${isDir ? "font-semibold text-foreground" : "text-foreground"}`}>
            {node.name}
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">{node.purpose}</p>
        </div>
      </div>
      {node.children?.map((child) => (
        <TreeItem key={child.name} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main Architecture View
   ────────────────────────────────────────────── */

export function ArchitectureView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Detection Pipeline */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              Detection Pipeline
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            End-to-end flow from camera frame capture to e-challan generation
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {pipelineStages.map((stage, i) => (
              <div key={stage.title} className="flex flex-1 items-stretch gap-3">
                <div className="flex flex-1 flex-col items-center rounded-lg border border-border bg-secondary/30 p-4 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stage.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {stage.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {stage.desc}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 border-border text-[10px] text-muted-foreground"
                  >
                    {stage.tech}
                  </Badge>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className="hidden items-center lg:flex">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm text-foreground">Backend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Python 3.11+", "Flask 3.x", "SQLAlchemy", "PyMySQL", "Gunicorn"].map((t) => (
              <Badge key={t} variant="secondary" className="bg-secondary text-secondary-foreground">{t}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[color:var(--success)]" />
              <CardTitle className="text-sm text-foreground">AI / ML</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["YOLOv8", "EasyOCR", "OpenCV", "NumPy", "Pillow"].map((t) => (
              <Badge key={t} variant="secondary" className="bg-secondary text-secondary-foreground">{t}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MonitorDot className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm text-foreground">Frontend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["Next.js 16", "React 19", "Recharts", "Tailwind CSS", "shadcn/ui"].map((t) => (
              <Badge key={t} variant="secondary" className="bg-secondary text-secondary-foreground">{t}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-border" />

      {/* File Tree Explorer */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">
              Project Structure
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete folder tree with per-file purpose explanations
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="flex flex-col gap-0.5">
              {projectTree.map((node) => (
                <TreeItem key={node.name} node={node} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
