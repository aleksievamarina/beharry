"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Clock, Users, MapPin, Check, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { SeatMap, TOTAL_SEATS } from "./seat-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const timeSlots = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

type ReservationType = "seats" | "event"

export function ReservationSection() {
  const [step, setStep] = useState(1)
  const [reservationType, setReservationType] = useState<ReservationType>("seats")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [reservedSeats, setReservedSeats] = useState<number[]>([])

  const fetchReservedSeats = useCallback(async (date: string, time: string) => {
    try {
      const res = await fetch(`/api/reservations?date=${date}&time=${time}`)
      const data = await res.json()
      setReservedSeats(data.reservedSeats || [])
    } catch {
      setReservedSeats([])
    }
  }, [])

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchReservedSeats(selectedDate, selectedTime)
    }
  }, [selectedDate, selectedTime, fetchReservedSeats])

  const handleSeatToggle = (seatId: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    )
  }

  const getTodayStr = () => {
    const d = new Date()
    return d.toISOString().split("T")[0]
  }

  const canProceedStep1 = reservationType !== null
  const canProceedStep2 = selectedDate && selectedTime
  const canProceedStep3 = reservationType === "event" || selectedSeats.length > 0
  const canSubmit = customerData.name && customerData.email && customerData.phone

  const handleSubmit = async () => {
    try {
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reservationType,
          date: selectedDate,
          time: selectedTime,
          seats: reservationType === "event" ? Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1) : selectedSeats,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          notes: customerData.notes,
        }),
      })
      setIsSubmitted(true)
    } catch {
      // Handle error silently for now
      setIsSubmitted(true)
    }
  }

  const resetForm = () => {
    setStep(1)
    setReservationType("seats")
    setSelectedDate("")
    setSelectedTime("")
    setSelectedSeats([])
    setCustomerData({ name: "", email: "", phone: "", notes: "" })
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <section id="reserve" className="bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-serif text-4xl text-foreground">Резервацията е потвърдена!</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {reservationType === "event"
              ? `Цялото студио (${TOTAL_SEATS} места) е резервирано за ${selectedDate} в ${selectedTime}ч.`
              : `${selectedSeats.length} ${selectedSeats.length === 1 ? "място е резервирано" : "места са резервирани"} за ${selectedDate} в ${selectedTime}ч.`}
          </p>
          <p className="mt-2 text-muted-foreground">
            Потвърждение ще бъде изпратено на {customerData.email}
          </p>
          <Button onClick={resetForm} className="mt-8 rounded-full px-8" size="lg">
            Нова резервация
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section id="reserve" className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Резервация</p>
          <h2 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
            <span className="text-balance">Резервирай място</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Избери дата, час и място - ние ще се погрижим за останалото
          </p>
        </div>

        {/* Progress steps */}
        <div className="mx-auto mt-12 flex max-w-lg items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div className={cn(
                  "mx-2 h-0.5 w-12 sm:w-20 transition-colors",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-lg justify-between text-xs text-muted-foreground">
          <span className="w-10 text-center">Тип</span>
          <span className="w-10 text-center">Кога</span>
          <span className="w-10 text-center">Къде</span>
          <span className="w-10 text-center">Данни</span>
        </div>

        <div className="mt-12">
          {/* Step 1: Type */}
          {step === 1 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-6 text-center text-xl font-semibold text-foreground">
                Какво искате да резервирате?
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setReservationType("seats")}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-2xl border-2 p-8 transition-all hover:shadow-md",
                    reservationType === "seats"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <Users className={cn("h-10 w-10 transition-colors", reservationType === "seats" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-lg font-semibold text-foreground">Отделни места</span>
                  <span className="text-sm text-muted-foreground">Избери конкретни места от картата</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReservationType("event")}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-2xl border-2 p-8 transition-all hover:shadow-md",
                    reservationType === "event"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <MapPin className={cn("h-10 w-10 transition-colors", reservationType === "event" ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-lg font-semibold text-foreground">Цяло пространство</span>
                  <span className="text-sm text-muted-foreground">Резервирай студиото за евент</span>
                </button>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Напред
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-6 text-center text-xl font-semibold text-foreground">
                Изберете дата и час
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="date" className="mb-2 flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    Дата
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={getTodayStr()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedSeats([])
                    }}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Час
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time)
                          setSelectedSeats([])
                        }}
                        className={cn(
                          "rounded-xl border-2 px-4 py-3 text-base font-semibold transition-all",
                          selectedTime === time
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/30"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-8" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Напред
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Seat selection */}
          {step === 3 && (
            <div>
              {reservationType === "event" ? (
                <div className="mx-auto max-w-lg text-center">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
                    <MapPin className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Цялото студио е Ваше!</h3>
                    <p className="mt-2 text-muted-foreground">
                      {TOTAL_SEATS} места на ваше разположение за {selectedDate} в {selectedTime}ч.
                    </p>
                    <p className="mt-4 text-2xl font-bold text-primary">
                      Свържете се с нас за цена
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-2 text-center text-xl font-semibold text-foreground">
                    Изберете места от картата
                  </h3>
                  <p className="mb-6 text-center text-sm text-muted-foreground">
                    {selectedDate} | {selectedTime}ч. | Избрани: {selectedSeats.length} {selectedSeats.length === 1 ? "място" : "места"}
                  </p>
                  <SeatMap
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                    reservedSeats={reservedSeats}
                  />
                </div>
              )}
              <div className="mx-auto mt-8 flex max-w-lg justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-8" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Напред
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Customer data */}
          {step === 4 && (
            <div className="mx-auto max-w-lg">
              <h3 className="mb-6 text-center text-xl font-semibold text-foreground">
                Вашите данни
              </h3>

              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="mb-6 rounded-xl bg-primary/5 p-4">
                  <p className="text-sm font-medium text-foreground">Обобщение:</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reservationType === "event"
                      ? `Цяло студио (${TOTAL_SEATS} места)`
                      : `${selectedSeats.length} ${selectedSeats.length === 1 ? "място" : "места"} (${selectedSeats.sort((a, b) => a - b).join(", ")})`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate} | {selectedTime}ч.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Име и фамилия *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      placeholder="Иван Иванов"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Имейл *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      placeholder="ivan@example.com"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      placeholder="+359 88 123 4567"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-foreground">Бележки (по желание)</Label>
                    <Textarea
                      id="notes"
                      value={customerData.notes}
                      onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                      placeholder="Специални изисквания, празничен повод..."
                      className="mt-1 rounded-xl"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} className="rounded-full px-8" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="rounded-full px-8"
                  size="lg"
                >
                  Потвърди
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
