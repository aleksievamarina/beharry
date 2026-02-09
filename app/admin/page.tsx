"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Gift,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Menu,
  X,
  Plus,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { StatsCards } from "@/components/admin/stats-cards"
import { ReservationsTable } from "@/components/admin/reservations-table"
import { VouchersTable } from "@/components/admin/vouchers-table"
import type { Reservation, Voucher } from "@/lib/store"

type Tab = "dashboard" | "reservations" | "vouchers"

interface Stats {
  todayReservations: number
  todaySeats: number
  totalRevenue: number
  cancelledReservations: number
  activeVouchers: number
  totalReservations: number
  totalVouchers: number
}

// --- Login Screen ---
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.success) {
        onLogin()
      } else {
        setError(data.error || "Грешно потребителско име или парола")
      }
    } catch {
      setError("Възникна грешка. Опитайте отново.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">BeHarry Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Влезте в администраторския панел</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-background p-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">Потребителско име</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Въведете потребителско име"
              className="rounded-xl"
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Парола</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Въведете парола"
                className="rounded-xl pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full"
          >
            {isLoading ? "Влизане..." : "Вход"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Обратно към сайта
          </Link>
        </p>
      </div>
    </div>
  )
}

// --- Voucher Generator Dialog ---
function VoucherGeneratorDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [voucherType, setVoucherType] = useState<"voucher" | "giftbox">("voucher")
  const [amount, setAmount] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [message, setMessage] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createdCode, setCreatedCode] = useState("")

  const reset = () => {
    setVoucherType("voucher")
    setAmount("")
    setRecipientName("")
    setSenderName("")
    setMessage("")
    setBuyerEmail("")
    setBuyerPhone("")
    setCreatedCode("")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const code = `BH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type: voucherType,
          amount: Number(amount),
          recipientName,
          senderName,
          message,
          buyerEmail,
          buyerPhone,
        }),
      })
      if (res.ok) {
        setCreatedCode(code)
        onCreated()
      }
    } catch {
      // silently handle
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset()
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {createdCode ? "Ваучерът е създаден" : "Генериране на ваучер"}
          </DialogTitle>
        </DialogHeader>

        {createdCode ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Код на ваучера:</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{createdCode}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Стойност: <span className="font-semibold text-foreground">{(Number(amount) / 1.9558).toFixed(2)} EUR / {amount} лв.</span>
            </p>
            {buyerEmail && (
              <p className="text-sm text-muted-foreground">
                Ще бъде изпратен на: <span className="font-medium text-foreground">{buyerEmail}</span>
              </p>
            )}
            <Button
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              className="mt-2 rounded-full"
            >
              Затвори
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-foreground">Тип</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["voucher", "giftbox"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVoucherType(type)}
                    className={cn(
                      "rounded-xl border-2 p-3 text-sm font-medium transition-all",
                      voucherType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {type === "voucher" ? "Дигитален ваучер" : "Подаръчна кутия"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="v-amount" className="text-foreground">Стойност (лв.) * {amount && Number(amount) > 0 && <span className="text-muted-foreground font-normal">({(Number(amount) / 1.9558).toFixed(2)} EUR)</span>}</Label>
              <Input
                id="v-amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Напр. 50"
                className="rounded-xl"
                required
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-recipient" className="text-foreground">Получател</Label>
                <Input
                  id="v-recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Име на получател"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-sender" className="text-foreground">Подарител</Label>
                <Input
                  id="v-sender"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Име на подарител"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Buyer info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="v-email" className="text-foreground">Имейл на купувач *</Label>
                <Input
                  id="v-email"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-phone" className="text-foreground">Телефон *</Label>
                <Input
                  id="v-phone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+359 ..."
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="v-message" className="text-foreground">Съобщение</Label>
              <Textarea
                id="v-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Персонално съобщение (по избор)"
                rows={2}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isCreating || !amount || !buyerEmail || !buyerPhone}
              className="w-full rounded-full"
            >
              {isCreating ? "Създаване..." : "Създай ваучер"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// --- Main Admin Dashboard ---
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [stats, setStats] = useState<Stats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showVoucherGenerator, setShowVoucherGenerator] = useState(false)

  // Check auth on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false))
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [statsRes, resRes, vouchRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/reservations"),
        fetch("/api/vouchers"),
      ])
      const [statsData, resData, vouchData] = await Promise.all([
        statsRes.json(),
        resRes.json(),
        vouchRes.json(),
      ])
      setStats(statsData)
      setReservations(resData.reservations || [])
      setVouchers(vouchData.vouchers || [])
    } catch {
      // silently handle
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    setIsAuthenticated(false)
  }

  const handleReservationStatus = async (id: string, status: "confirmed" | "cancelled") => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        console.error("[v0] Failed to update reservation:", await res.text())
      }
      await fetchData()
    } catch (err) {
      console.error("[v0] Error updating reservation:", err)
    }
  }

  const handleVoucherStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/vouchers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await fetchData()
    } catch {
      // silently handle
    }
  }

  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  const navItems = [
    { id: "dashboard" as Tab, label: "Табло", icon: LayoutDashboard },
    { id: "reservations" as Tab, label: "Резервации", icon: CalendarDays },
    { id: "vouchers" as Tab, label: "Ваучери", icon: Gift },
  ]

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/" className="font-serif text-xl text-foreground">
            BeHarry
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Затвори меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="h-5 w-5" />
            Към сайта
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Изход
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => {}}
          role="presentation"
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Отвори меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "vouchers" && (
              <Button
                onClick={() => setShowVoucherGenerator(true)}
                size="sm"
                className="rounded-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Нов ваучер
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="rounded-full bg-transparent"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Обнови
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {isLoading && !stats ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && stats && (
                <div className="space-y-8">
                  <StatsCards stats={stats} />

                  {/* Recent reservations */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Последни резервации</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("reservations")}
                        className="text-primary"
                      >
                        Виж всички
                      </Button>
                    </div>
                    <ReservationsTable
                      reservations={reservations.slice(0, 5)}
                      onStatusChange={handleReservationStatus}
                    />
                  </div>

                  {/* Recent vouchers */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Последни ваучери</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveTab("vouchers")
                            setShowVoucherGenerator(true)
                          }}
                          className="rounded-full"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Нов
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("vouchers")}
                          className="text-primary"
                        >
                          Виж всички
                        </Button>
                      </div>
                    </div>
                    <VouchersTable
                      vouchers={vouchers.slice(0, 5)}
                      onStatusChange={handleVoucherStatus}
                    />
                  </div>
                </div>
              )}

              {activeTab === "reservations" && (
                <ReservationsTable
                  reservations={reservations}
                  onStatusChange={handleReservationStatus}
                />
              )}

              {activeTab === "vouchers" && (
                <VouchersTable
                  vouchers={vouchers}
                  onStatusChange={handleVoucherStatus}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Voucher generator dialog */}
      <VoucherGeneratorDialog
        open={showVoucherGenerator}
        onOpenChange={setShowVoucherGenerator}
        onCreated={fetchData}
      />
    </div>
  )
}
