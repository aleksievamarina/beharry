"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Check, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order") || ""
  const type = searchParams.get("type") || "voucher"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/logo-beharry.svg" alt="BeHarry" width={120} height={48} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-lg">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="font-serif text-3xl text-foreground">
            Плащането е успешно!
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            {type === "voucher"
              ? "Вашият ваучер е генериран и ще бъде изпратен по имейл."
              : "Вашата резервация е потвърдена. Ще получите потвърждение по имейл."}
          </p>

          {orderId && (
            <div className="mt-6 rounded-xl bg-background p-4">
              <p className="text-sm text-muted-foreground">Номер на поръчка</p>
              <p className="font-mono text-xl font-bold text-primary">#{orderId}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Потвърждение е изпратено на вашия имейл</span>
          </div>

          <Link href="/">
            <Button variant="outline" className="mt-8 rounded-full bg-transparent" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Обратно към сайта
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
