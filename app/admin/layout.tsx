import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BeHarry Admin | Управление",
  description: "Административен панел за управление на керамично студио BeHarry",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
