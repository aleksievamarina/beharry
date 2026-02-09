"use client"

import { CalendarCheck, Users, CreditCard, Clock, Gift, TrendingUp } from "lucide-react"

interface StatsData {
  todayReservations: number
  todaySeats: number
  totalRevenue: number
  cancelledReservations: number
  activeVouchers: number
  totalReservations: number
  totalVouchers: number
}

export function StatsCards({ stats }: { stats: StatsData }) {
  const cards = [
    {
      label: "Резервации днес",
      value: stats.todayReservations,
      icon: CalendarCheck,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Места днес",
      value: `${stats.todaySeats} / 42`,
      icon: Users,
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Отказани резервации",
      value: stats.cancelledReservations,
      icon: Clock,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Приходи от ваучери",
      value: `${stats.totalRevenue} лв.`,
      icon: TrendingUp,
      accent: "bg-green-500/10 text-green-600",
    },
    {
      label: "Активни ваучери",
      value: stats.activeVouchers,
      icon: Gift,
      accent: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Общо резервации",
      value: stats.totalReservations,
      icon: CreditCard,
      accent: "bg-slate-500/10 text-slate-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.accent}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
