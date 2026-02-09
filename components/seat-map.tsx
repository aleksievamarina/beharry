"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { useRef, useState, useCallback, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize } from "lucide-react"

interface SeatMapProps {
  selectedSeats: number[]
  onSeatToggle: (seatId: number) => void
  reservedSeats?: number[]
}

interface TableDef {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  seats: { id: number; cx: number; cy: number }[]
}

const S = 16
const GAP = 6

const tables: TableDef[] = [
  {
    id: "tA", label: "A", x: 40, y: 70, width: 110, height: 40,
    seats: [
      { id: 1, cx: 65, cy: 70 - S - GAP }, { id: 2, cx: 125, cy: 70 - S - GAP },
      { id: 3, cx: 65, cy: 70 + 40 + S + GAP }, { id: 4, cx: 125, cy: 70 + 40 + S + GAP },
    ],
  },
  {
    id: "tB", label: "B", x: 200, y: 70, width: 110, height: 40,
    seats: [
      { id: 5, cx: 225, cy: 70 - S - GAP }, { id: 6, cx: 285, cy: 70 - S - GAP },
      { id: 7, cx: 225, cy: 70 + 40 + S + GAP }, { id: 8, cx: 285, cy: 70 + 40 + S + GAP },
    ],
  },
  {
    id: "tC", label: "C", x: 440, y: 70, width: 110, height: 40,
    seats: [
      { id: 9, cx: 465, cy: 70 - S - GAP }, { id: 10, cx: 525, cy: 70 - S - GAP },
      { id: 11, cx: 465, cy: 70 + 40 + S + GAP }, { id: 12, cx: 525, cy: 70 + 40 + S + GAP },
    ],
  },
  {
    id: "tD", label: "D", x: 40, y: 200, width: 80, height: 36,
    seats: [
      { id: 13, cx: 55, cy: 200 - S - GAP }, { id: 14, cx: 105, cy: 200 - S - GAP },
      { id: 15, cx: 55, cy: 200 + 36 + S + GAP }, { id: 16, cx: 105, cy: 200 + 36 + S + GAP },
    ],
  },
  {
    id: "tE", label: "E", x: 215, y: 175, width: 50, height: 180,
    seats: [
      { id: 17, cx: 215 - S - GAP, cy: 195 }, { id: 18, cx: 215 + 50 + S + GAP, cy: 195 },
      { id: 19, cx: 215 - S - GAP, cy: 245 }, { id: 20, cx: 215 + 50 + S + GAP, cy: 245 },
      { id: 25, cx: 215 - S - GAP, cy: 300 }, { id: 26, cx: 215 + 50 + S + GAP, cy: 300 },
      { id: 27, cx: 215 - S - GAP, cy: 350 }, { id: 28, cx: 215 + 50 + S + GAP, cy: 350 },
    ],
  },
  {
    id: "tF", label: "F", x: 440, y: 195, width: 110, height: 40,
    seats: [
      { id: 21, cx: 465, cy: 195 - S - GAP }, { id: 22, cx: 525, cy: 195 - S - GAP },
      { id: 23, cx: 465, cy: 195 + 40 + S + GAP }, { id: 24, cx: 525, cy: 195 + 40 + S + GAP },
    ],
  },
  {
    id: "tG", label: "G", x: 50, y: 400, width: 80, height: 70,
    seats: [
      { id: 29, cx: 50 - S - GAP, cy: 415 }, { id: 30, cx: 50 + 80 + S + GAP, cy: 415 },
      { id: 31, cx: 50 - S - GAP, cy: 455 }, { id: 32, cx: 50 + 80 + S + GAP, cy: 455 },
    ],
  },
  {
    id: "tH", label: "H", x: 210, y: 400, width: 80, height: 70,
    seats: [
      { id: 33, cx: 210 - S - GAP, cy: 415 }, { id: 34, cx: 210 + 80 + S + GAP, cy: 415 },
      { id: 35, cx: 210 - S - GAP, cy: 455 }, { id: 36, cx: 210 + 80 + S + GAP, cy: 455 },
    ],
  },
  {
    id: "tI", label: "I", x: 420, y: 560, width: 90, height: 80,
    seats: [
      { id: 37, cx: 420 - S - GAP, cy: 580 }, { id: 38, cx: 420 + 90 + S + GAP, cy: 580 },
      { id: 39, cx: 420 - S - GAP, cy: 625 }, { id: 40, cx: 420 + 90 + S + GAP, cy: 625 },
    ],
  },
  {
    id: "tJ", label: "J", x: 430, y: 700, width: 70, height: 50,
    seats: [
      { id: 41, cx: 430 - S - GAP, cy: 725 }, { id: 42, cx: 430 + 70 + S + GAP, cy: 725 },
    ],
  },
]

const TOTAL_SEATS = 42
export { TOTAL_SEATS }

const SVG_W = 620
const SVG_H = 790

export function SeatMap({ selectedSeats, onSeatToggle, reservedSeats = [] }: SeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: SVG_W, h: SVG_H })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const zoom = useCallback((factor: number) => {
    setViewBox((prev) => {
      const newW = Math.max(200, Math.min(SVG_W, prev.w * factor))
      const newH = Math.max(250, Math.min(SVG_H, newW * (SVG_H / SVG_W)))
      const cx = prev.x + prev.w / 2
      const cy = prev.y + prev.h / 2
      const newX = Math.max(0, Math.min(SVG_W - newW, cx - newW / 2))
      const newY = Math.max(0, Math.min(SVG_H - newH, cy - newH / 2))
      return { x: newX, y: newY, w: newW, h: newH }
    })
  }, [])

  const resetZoom = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: SVG_W, h: SVG_H })
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (viewBox.w < SVG_W - 10 || viewBox.h < SVG_H - 10) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [viewBox])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scaleX = viewBox.w / rect.width
    const scaleY = viewBox.h / rect.height
    const dx = (panStart.x - e.clientX) * scaleX
    const dy = (panStart.y - e.clientY) * scaleY
    setPanStart({ x: e.clientX, y: e.clientY })
    setViewBox((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(SVG_W - prev.w, prev.x + dx)),
      y: Math.max(0, Math.min(SVG_H - prev.h, prev.y + dy)),
    }))
  }, [isPanning, panStart, viewBox])

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const isZoomed = viewBox.w < SVG_W - 10

  const getSeatStatus = (seatId: number) => {
    if (reservedSeats.includes(seatId)) return "reserved"
    if (selectedSeats.includes(seatId)) return "selected"
    return "available"
  }

  const getSeatFill = (status: string) => {
    switch (status) {
      case "reserved": return "hsl(20 8% 50%)"
      case "selected": return "hsl(16 65% 45%)"
      default: return "hsl(30 20% 95%)"
    }
  }

  const getSeatStroke = (status: string) => {
    switch (status) {
      case "reserved": return "hsl(20 8% 40%)"
      case "selected": return "hsl(16 65% 35%)"
      default: return "hsl(30 15% 75%)"
    }
  }

  const getTextFill = (status: string) => {
    return status === "available" ? "hsl(20 15% 30%)" : "hsl(30 25% 97%)"
  }

  const handleSeatClick = useCallback((seatId: number, status: string) => {
    if (status !== "reserved") {
      onSeatToggle(seatId)
    }
  }, [onSeatToggle])

  const renderSeat = (seat: { id: number; cx: number; cy: number }) => {
    const status = getSeatStatus(seat.id)
    const seatR = isMobile ? S + 3 : S
    const fontSize = isMobile ? 13 : 11
    return (
      <g
        key={seat.id}
        onClick={() => handleSeatClick(seat.id, status)}
        className={cn(
          "transition-all duration-200",
          status === "reserved" ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        )}
        role="button"
        tabIndex={status === "reserved" ? -1 : 0}
        aria-label={`Място ${seat.id}${status === "reserved" ? " (заето)" : status === "selected" ? " (избрано)" : " (свободно)"}`}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && status !== "reserved") {
            e.preventDefault()
            onSeatToggle(seat.id)
          }
        }}
      >
        <circle
          cx={seat.cx}
          cy={seat.cy}
          r={seatR}
          fill={getSeatFill(status)}
          stroke={getSeatStroke(status)}
          strokeWidth="2"
          className={cn(
            "transition-all duration-200",
            status === "available" && "hover:fill-[hsl(16_65%_45%/0.2)] hover:stroke-[hsl(16_65%_45%)]"
          )}
        />
        <text
          x={seat.cx}
          y={seat.cy + 5}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="600"
          fill={getTextFill(status)}
          className="pointer-events-none select-none"
        >
          {seat.id}
        </text>
      </g>
    )
  }

  return (
    <div className="w-full">
      {/* Zoom controls */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoom(0.65)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Приближи"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoom(1.5)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Отдалечи"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          {isZoomed && (
            <button
              type="button"
              onClick={resetZoom}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              aria-label="Нулиране"
            >
              <Maximize className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Цяла карта</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border border-[hsl(30_15%_75%)] bg-[hsl(30_20%_95%)]" />
            Свободно
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            Избрано
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-[hsl(20_8%_50%)] opacity-40" />
            Заето
          </span>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border",
          isZoomed ? "cursor-grab active:cursor-grabbing" : ""
        )}
        style={{ touchAction: isZoomed ? "none" : "pan-y" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full"
          style={{ aspectRatio: `${SVG_W} / ${SVG_H}` }}
          role="img"
          aria-label="Карта на местата в студиото"
        >
          {/* Background */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="16" fill="hsl(20 15% 15%)" />

          {/* Windows top */}
          <line x1="40" y1="12" x2="320" y2="12" stroke="hsl(30 15% 50%)" strokeWidth="3" strokeLinecap="round" />
          <text x="180" y="30" textAnchor="middle" fontSize="11" fill="hsl(30 15% 60%)" fontWeight="500">прозорец</text>
          <line x1="370" y1="12" x2="580" y2="12" stroke="hsl(30 15% 50%)" strokeWidth="3" strokeLinecap="round" />
          <text x="475" y="30" textAnchor="middle" fontSize="11" fill="hsl(30 15% 60%)" fontWeight="500">прозорец</text>

          {/* Window left */}
          <line x1="12" y1="50" x2="12" y2="170" stroke="hsl(30 15% 50%)" strokeWidth="3" strokeLinecap="round" />
          <text x="18" y="115" fontSize="11" fill="hsl(30 15% 60%)" fontWeight="500" transform="rotate(-90 18 115)">прозорци</text>
          <line x1="12" y1="185" x2="12" y2="280" stroke="hsl(30 15% 50%)" strokeWidth="3" strokeLinecap="round" />
          <text x="18" y="235" fontSize="11" fill="hsl(30 15% 60%)" fontWeight="500" transform="rotate(-90 18 235)">рафтове</text>

          {/* Tables and seats */}
          {tables.map((table) => (
            <g key={table.id}>
              <rect x={table.x} y={table.y} width={table.width} height={table.height} rx="6" fill="hsl(30 15% 75%)" stroke="hsl(30 12% 65%)" strokeWidth="1.5" />
              <text x={table.x + table.width / 2} y={table.y + table.height / 2 + 4} textAnchor="middle" fontSize="10" fill="hsl(20 15% 40%)" fontWeight="500">{table.label}</text>
              {table.seats.map(renderSeat)}
            </g>
          ))}

          {/* Wall divider */}
          <line x1="360" y1="510" x2="590" y2="510" stroke="hsl(30 15% 55%)" strokeWidth="2" />
          <text x="475" y="530" textAnchor="middle" fontSize="12" fill="hsl(30 15% 60%)" fontWeight="500">стена</text>

          {/* Room label */}
          <text x="310" y="770" textAnchor="middle" fontSize="13" fontWeight="600" fill="hsl(30 15% 55%)" letterSpacing="2">BeHarry Studio</text>
        </svg>
      </div>

      {/* Mobile hint */}
      {isMobile && !isZoomed && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Натиснете + за да приближите и изберете места по-лесно
        </p>
      )}
    </div>
  )
}
