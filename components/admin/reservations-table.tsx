"use client"

import { useState } from "react"
import { X, Eye, Search, Filter } from "lucide-react"
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
import type { Reservation } from "@/lib/store"

const statusLabels: Record<string, string> = {
  confirmed: "Потвърдена",
  cancelled: "Отказана",
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

interface ReservationsTableProps {
  reservations: Reservation[]
  onStatusChange: (id: string, status: Reservation["status"]) => void
}

export function ReservationsTable({ reservations, onStatusChange }: ReservationsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search)
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търси по име, имейл, телефон..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["all", "confirmed", "cancelled"].map((status) => (
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
              <TableHead className="font-semibold">Клиент</TableHead>
              <TableHead className="font-semibold">Тип</TableHead>
              <TableHead className="font-semibold">Дата</TableHead>
              <TableHead className="font-semibold">Час</TableHead>
              <TableHead className="font-semibold">Места</TableHead>
              <TableHead className="font-semibold">Статус</TableHead>
              <TableHead className="text-right font-semibold">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Няма намерени резервации
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="group">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{r.customerName}</p>
                      <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {r.type === "event" ? "Евент" : "Места"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{r.date}</TableCell>
                  <TableCell className="text-sm text-foreground">{r.time}</TableCell>
                  <TableCell className="text-sm text-foreground">
                    {r.type === "event" ? "Цяло студио" : r.seats.length}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusColors[r.status])}>
                      {statusLabels[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReservation(r)}
                        className="h-8 w-8 p-0"
                        aria-label="Преглед"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {r.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusChange(r.id, "cancelled")}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label="Откажи"
                        >
                          <X className="h-4 w-4" />
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

      <p className="text-sm text-muted-foreground">
        Показани: {filtered.length} от {reservations.length} резервации
      </p>

      {/* Detail dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Детайли за резервация</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Клиент</p>
                  <p className="mt-1 font-medium text-foreground">{selectedReservation.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Статус</p>
                  <Badge variant="outline" className={cn("mt-1 text-xs", statusColors[selectedReservation.status])}>
                    {statusLabels[selectedReservation.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Имейл</p>
                  <p className="mt-1 text-sm text-foreground">{selectedReservation.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Телефон</p>
                  <p className="mt-1 text-sm text-foreground">{selectedReservation.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Дата</p>
                  <p className="mt-1 text-sm text-foreground">{selectedReservation.date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Час</p>
                  <p className="mt-1 text-sm text-foreground">{selectedReservation.time}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Тип</p>
                  <p className="mt-1 text-sm text-foreground">
                    {selectedReservation.type === "event" ? "Цяло студио (евент)" : "Отделни места"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Места</p>
                  <p className="mt-1 text-sm text-foreground">
                    {selectedReservation.type === "event"
                      ? "Всички (42)"
                      : selectedReservation.seats.sort((a, b) => a - b).join(", ")}
                  </p>
                </div>
              </div>
              {selectedReservation.notes && (
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Бележки</p>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-sm text-foreground">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Създадена на</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(selectedReservation.createdAt).toLocaleString("bg-BG")}
                </p>
              </div>
              {selectedReservation.status === "confirmed" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onStatusChange(selectedReservation.id, "cancelled")
                      setSelectedReservation(null)
                    }}
                    className="flex-1 rounded-full bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Откажи резервация
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
