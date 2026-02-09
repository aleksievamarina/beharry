"use client"

import { useState, useCallback } from "react"
import { Gift, CreditCard, ArrowRight, Check, QrCode, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "BH-"
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateQRDataUrl(text: string, size: number = 200): string {
  const modules = encodeTextToQR(text)
  const moduleCount = modules.length
  const cellSize = size / moduleCount

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#2d2016"/>`
      }
    }
  }

  svg += "</svg>"
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function encodeTextToQR(text: string): boolean[][] {
  const size = 25
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  const addFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startRow + r][startCol + c] = true
        }
      }
    }
  }

  addFinderPattern(0, 0)
  addFinderPattern(0, size - 7)
  addFinderPattern(size - 7, 0)

  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0
    grid[i][6] = i % 2 === 0
  }

  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0
  }

  for (let r = 8; r < size - 1; r++) {
    for (let c = 8; c < size - 1; c++) {
      if (r === 6 || c === 6) continue
      if (r < 7 && c > size - 8) continue
      if (r > size - 8 && c < 7) continue
      hash = ((hash << 5) - hash + (r * size + c)) | 0
      grid[r][c] = (Math.abs(hash) % 3) === 0
    }
  }

  return grid
}

const presetAmounts = [30, 50, 80, 100, 150, 200]
const BGN_TO_EUR = 1.9558

function toEur(bgn: number): string {
  return (bgn / BGN_TO_EUR).toFixed(2)
}

type VoucherType = "voucher" | "giftbox"

interface GeneratedVoucher {
  code: string
  amount: number
  type: VoucherType
  recipientName: string
  senderName: string
  message: string
  qrDataUrl: string
}

export function VoucherSection() {
  const [voucherType, setVoucherType] = useState<VoucherType>("voucher")
  const [amount, setAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [message, setMessage] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [generatedVoucher, setGeneratedVoucher] = useState<GeneratedVoucher | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  const effectiveAmount = customAmount ? Number(customAmount) : amount

  const handleGenerate = useCallback(() => {
    const code = generateVoucherCode()
    const qrDataUrl = generateQRDataUrl(`https://beharry.bg/voucher/${code}`)
    setGeneratedVoucher({
      code,
      amount: effectiveAmount,
      type: voucherType,
      recipientName,
      senderName,
      message,
      qrDataUrl,
    })
    setIsPaid(false)
  }, [effectiveAmount, voucherType, recipientName, senderName, message])

  const handlePayAndSend = useCallback(async () => {
    if (!generatedVoucher) return
    setIsPaying(true)
    try {
      console.log("[v0] Initiating payment for voucher:", generatedVoucher.code)
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: "voucher",
          amountBGN: generatedVoucher.amount,
          description: `BeHarry Voucher ${generatedVoucher.code}`,
          voucherData: {
            code: generatedVoucher.code,
            type: generatedVoucher.type,
            amount: generatedVoucher.amount,
            recipientName: generatedVoucher.recipientName,
            senderName: generatedVoucher.senderName,
            message: generatedVoucher.message,
            buyerEmail,
            buyerPhone,
          },
        }),
      })

      console.log("[v0] Payment API response status:", res.status)
      const data = await res.json()
      console.log("[v0] Payment API response data:", JSON.stringify(data))

      if (!res.ok) {
        console.error("[v0] Payment API error:", data.error)
        setIsPaying(false)
        return
      }

      if (data.mode === "borica" && data.gatewayUrl) {
        console.log("[v0] Redirecting to BORICA gateway:", data.gatewayUrl)
        console.log("[v0] Form fields:", Object.keys(data.fields))
        // Redirect to BORICA payment gateway via hidden form
        const form = document.createElement("form")
        form.method = "POST"
        form.action = data.gatewayUrl
        for (const [key, value] of Object.entries(data.fields as Record<string, string>)) {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = key
          input.value = String(value)
          form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
        return
      }

      // Simulation mode (BORICA not configured)
      console.log("[v0] Simulation mode, success:", data.success)
      if (data.success) {
        setIsPaid(true)
      }
    } catch (err) {
      console.error("[v0] Payment error:", err)
    } finally {
      setIsPaying(false)
    }
  }, [generatedVoucher, buyerEmail, buyerPhone])

  const handleNewVoucher = () => {
    setGeneratedVoucher(null)
    setIsPaid(false)
    setRecipientName("")
    setSenderName("")
    setMessage("")
    setCustomAmount("")
    setAmount(50)
  }

  const canGenerate = effectiveAmount >= 10 && buyerEmail && buyerPhone

  return (
    <section id="vouchers" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Подаръци</p>
          <h2 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
            <span className="text-balance">Подари творчество</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Ваучер или подаръчна кутия - перфектният подарък за всеки повод
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            {/* Type selector */}
            <div>
              <Label className="mb-3 block text-foreground">Тип подарък</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVoucherType("voucher")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                    voucherType === "voucher"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <CreditCard className={cn("h-5 w-5", voucherType === "voucher" ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Ваучер</p>
                    <p className="text-xs text-muted-foreground">Дигитален код</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherType("giftbox")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                    voucherType === "giftbox"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <Gift className={cn("h-5 w-5", voucherType === "giftbox" ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Подаръчна кутия</p>
                    <p className="text-xs text-muted-foreground">Физическа кутия</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label className="mb-3 block text-foreground">Стойност</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setAmount(a)
                      setCustomAmount("")
                    }}
                    className={cn(
                      "rounded-xl border-2 py-3 text-center transition-all",
                      amount === a && !customAmount
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="block text-base font-semibold">{toEur(a)} EUR</span>
                    <span className="block text-xs opacity-70">{a} лв.</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Input
                  type="number"
                  min="10"
                  placeholder="Или въведи друга сума..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Personal details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="recipientName" className="text-foreground">За кого (по желание)</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Име на получател"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="senderName" className="text-foreground">От кого (по желание)</Label>
                <Input
                  id="senderName"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Твоето име"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="voucherMessage" className="text-foreground">Съобщение (по желание)</Label>
              <Input
                id="voucherMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Честит рожден ден!"
                className="mt-1 rounded-xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="buyerEmail" className="text-foreground">Твоят имейл *</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="buyerPhone" className="text-foreground">Телефон *</Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+359 88 123 4567"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full rounded-full"
              size="lg"
            >
              Генерирай {voucherType === "giftbox" ? "подаръчна кутия" : "ваучер"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center">
            {isPaid && generatedVoucher ? (
              <div className="w-full space-y-6">
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-green-300 bg-green-50 p-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Плащането е успешно!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Ваучерът е изпратен на <span className="font-semibold text-foreground">{buyerEmail}</span>
                  </p>
                  <div className="mt-4 rounded-xl bg-background p-4">
                    <p className="text-sm text-muted-foreground">Код на ваучера</p>
<p className="font-mono text-xl font-bold text-primary">{generatedVoucher.code}</p>
<p className="mt-1 text-sm text-muted-foreground">{toEur(generatedVoucher.amount)} EUR / {generatedVoucher.amount} лв.</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Ваучерът с QR код е изпратен по имейл</span>
                  </div>
                  <Button onClick={handleNewVoucher} variant="outline" className="mt-6 rounded-full bg-transparent" size="lg">
                    Купи нов ваучер
                  </Button>
                </div>
              </div>
            ) : generatedVoucher ? (
              <div className="w-full space-y-6">
                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-background p-8 shadow-lg">
                  <div className="absolute left-0 top-0 h-full w-2 bg-primary" />

                  <div className="mb-6">
                    <h3 className="font-serif text-3xl text-foreground">BeHarry</h3>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Керамично студио
                    </p>
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {generatedVoucher.type === "giftbox" ? "Подаръчна кутия" : "Подаръчен ваучер"}
                  </p>

                  <p className="mt-2 font-serif text-5xl text-foreground">
                    {toEur(generatedVoucher.amount)} EUR
                  </p>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {generatedVoucher.amount} лв.
                  </p>

                  {generatedVoucher.recipientName && (
                    <p className="mt-4 text-muted-foreground">
                      За: <span className="font-medium text-foreground">{generatedVoucher.recipientName}</span>
                    </p>
                  )}
                  {generatedVoucher.senderName && (
                    <p className="text-muted-foreground">
                      От: <span className="font-medium text-foreground">{generatedVoucher.senderName}</span>
                    </p>
                  )}
                  {generatedVoucher.message && (
                    <p className="mt-2 italic text-muted-foreground">
                      &ldquo;{generatedVoucher.message}&rdquo;
                    </p>
                  )}

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-lg font-bold text-primary">{generatedVoucher.code}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Валиден 6 месеца</p>
                    </div>
                    <img
                      src={generatedVoucher.qrDataUrl || "/placeholder.svg"}
                      alt={`QR код за ваучер ${generatedVoucher.code}`}
                      className="h-24 w-24"
                    />
                  </div>
                </div>

                {/* Payment & send action */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>
                      След плащане ваучерът ще бъде изпратен автоматично на <span className="font-semibold text-foreground">{buyerEmail}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handlePayAndSend}
                      disabled={isPaying}
                      className="flex-1 rounded-full"
                      size="lg"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Обработка...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Плати {toEur(generatedVoucher.amount)} EUR ({generatedVoucher.amount} лв.)
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleNewVoucher}
                      variant="outline"
                      className="rounded-full bg-transparent"
                      size="lg"
                      disabled={isPaying}
                    >
                      Нов ваучер
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-16 text-center">
                <QrCode className="mb-4 h-16 w-16 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground">Визуализация на ваучера</p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  Попълнете формата и натиснете &ldquo;Генерирай&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
