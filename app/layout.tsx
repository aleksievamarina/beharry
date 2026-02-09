import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'

import './globals.css'

const _dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dm-sans' })
const _dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-dm-serif' })

export const metadata: Metadata = {
  title: 'BeHarry | Керамично студио',
  description: 'Нарисувай си сам керамика! Избери форма, потопи се в цветове и създай лична магия. Резервирай място в нашето студио в София.',
}

export const viewport: Viewport = {
  themeColor: '#D4593E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg">
      <body className={`${_dmSans.variable} ${_dmSerif.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
