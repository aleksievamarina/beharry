"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { X, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

function FailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order") || ""
  const code = searchParams.get("code") || ""
  const msg = searchParams.get("msg") || ""
  const error = searchParams.get("error") || ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/logo-beharry.svg" alt="BeHarry" width={120} height={48} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
          {/* Failed icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <X className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="font-serif text-3xl text-foreground">
            Плащането не беше успешно
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            {msg || error || "Възникна грешка при обработката на плащането. Моля, опитайте отново."}
          </p>

          {(orderId || code) && (
            <div className="mt-6 rounded-xl bg-background p-4">
              {orderId && (
                <p className="text-sm text-muted-foreground">
                  Поръчка: <span className="font-mono font-semibold">#{orderId}</span>
                </p>
              )}
              {code && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Код на грешка: <span className="font-mono font-semibold">{code}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/#vouchers">
              <Button className="w-full rounded-full sm:w-auto" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Опитай отново
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full rounded-full bg-transparent sm:w-auto" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Обратно към сайта
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            При проблем се свържете с нас на{" "}
            <a href="tel:+35988555604" className="text-primary hover:underline">
              +359 88 555 6604
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  )
}
