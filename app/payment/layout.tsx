import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BeHarry | Плащане",
  description: "Обработка на плащане",
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
