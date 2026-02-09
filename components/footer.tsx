"use client"

import Image from "next/image"
import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Image
              src="/logo-beharry.svg"
              alt="BeHarry"
              width={140}
              height={56}
              className="brightness-0 invert"
            />
            <p className="mt-3 text-sm leading-relaxed text-background/60">
              Бъди рошав. Бъди артист. Бъди Harry.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/beharry.bg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/beharry.bg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@beharry.bg?_r=1&_t=ZN-93hPNUcCuiE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .59.05.86.12V9.01a6.27 6.27 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.55a8.19 8.19 0 0 0 4.78 1.53V6.69h-1.02z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Локация</h4>
            <div className="space-y-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=%D0%B1%D1%83%D0%BB.+%D0%A6%D0%B0%D1%80%D0%B8%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%BE+%D1%88%D0%BE%D1%81%D0%B5+89+%D0%B1%D0%BB.+112+%D0%A1%D0%BE%D1%84%D0%B8%D1%8F"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-background/60 group-hover:text-background transition-colors">
                  {'бул. "Цариградско шосе" 89, бл. 112'}<br />
                  кв. Гео Милев, гр. София, 1113
                </p>
              </a>
              <a href="tel:+35988555604" className="flex items-center gap-3 group">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-background/60 group-hover:text-background transition-colors">+359 88 555 6604</p>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Работно време</h4>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm leading-relaxed text-background/60">
                <p>Понеделник - Петък</p>
                <p className="font-medium text-background/80">10:00 - 22:00</p>
                <p className="mt-2">Събота - Неделя</p>
                <p className="font-medium text-background/80">10:00 - 22:00</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Навигация</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: "#home", label: "Начало" },
                { href: "#how-it-works", label: "Как работи" },
                { href: "#reserve", label: "Резервация" },
                { href: "#events", label: "Събития" },
                { href: "#vouchers", label: "Ваучери" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-background/60 transition-colors hover:text-background"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 border-t border-background/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-background/40">
              {`© ${new Date().getFullYear()} BeHarry. Всички права запазени.`}
            </p>
            <Link href="/admin" className="text-xs text-background/20 transition-colors hover:text-background/40">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
