"use client"

import { useState } from "react"
import { Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Voucher } from "@/lib/store"

const statusLabels: Record<string, string> = {
  paid: "Платен",
  used: "Използван",
  expired: "Изтекъл",
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  used: "bg-blue-100 text-blue-700 border-blue-200",
  expired: "bg-red-100 text-red-700 border-red-200",
}

interface VouchersTableProps {
  vouchers: Voucher[]
  onStatusChange: (id: string, status: Voucher["status"]) => void
}

export function VouchersTable({ vouchers, onStatusChange }: VouchersTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  const filtered = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
      v.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      v.senderName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = filtered.reduce((sum, v) => sum + v.amount, 0)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търси по код, имейл, име..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["all", "paid", "used", "expired"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {status === "all" ? "Всички" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Код</TableHead>
              <TableHead className="font-semibold">Тип</TableHead>
              <TableHead className="font-semibold">Стойност</TableHead>
              <TableHead className="font-semibold">Получател</TableHead>
              <TableHead className="font-semibold">Купувач</TableHead>
              <TableHead className="font-semibold">Статус</TableHead>
              <TableHead className="text-right font-semibold">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Няма намерени ваучери
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id} className="group">
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-primary">{v.code}</span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {v.type === "giftbox" ? "Подаръчна кутия" : "Ваучер"}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">
                    {v.amount} лв.
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{v.recipientName || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{v.buyerEmail}</p>
                      <p className="text-xs text-muted-foreground">{v.buyerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusColors[v.status])}>
                      {statusLabels[v.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVoucher(v)}
                        className="h-8 w-8 p-0"
                        aria-label="Преглед"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {v.status === "paid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusChange(v.id, "used")}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Маркирай като използван"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {v.status === "paid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusChange(v.id, "expired")}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label="Маркирай като изтекъл"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Показани: {filtered.length} от {vouchers.length} ваучери
        </p>
        <p className="text-sm font-medium text-foreground">
          Общо: {totalRevenue} лв.
        </p>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedVoucher} onOpenChange={() => setSelectedVoucher(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Детайли за ваучер</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4">
                <div>
                  <p className="font-mono text-xl font-bold text-primary">{selectedVoucher.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVoucher.type === "giftbox" ? "Подаръчна кутия" : "Дигитален ваучер"}
                  </p>
                </div>
                <p className="font-serif text-3xl font-bold text-foreground">{selectedVoucher.amount} лв.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Получател</p>
                  <p className="mt-1 text-sm text-foreground">{selectedVoucher.recipientName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Подарител</p>
                  <p className="mt-1 text-sm text-foreground">{selectedVoucher.senderName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Имейл на купувач</p>
                  <p className="mt-1 text-sm text-foreground">{selectedVoucher.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Телефон</p>
                  <p className="mt-1 text-sm text-foreground">{selectedVoucher.buyerPhone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Статус</p>
                  <Badge variant="outline" className={cn("mt-1 text-xs", statusColors[selectedVoucher.status])}>
                    {statusLabels[selectedVoucher.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Създаден на</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(selectedVoucher.createdAt).toLocaleString("bg-BG")}
                  </p>
                </div>
              </div>
              {selectedVoucher.message && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Съобщение</p>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm italic text-foreground">
                    &ldquo;{selectedVoucher.message}&rdquo;
                  </p>
                </div>
              )}
              {selectedVoucher.status === "paid" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      onStatusChange(selectedVoucher.id, "used")
                      setSelectedVoucher(null)
                    }}
                    className="flex-1 rounded-full"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Маркирай като използван
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
