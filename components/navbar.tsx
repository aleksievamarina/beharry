"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#home", label: "Начало" },
  { href: "#how-it-works", label: "Как работи" },
  { href: "#reserve", label: "Резервация" },
  { href: "#events", label: "Събития" },
  { href: "#vouchers", label: "Ваучери" },
  { href: "#contact", label: "Контакти" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  useEffect(() => {
    if (isAdmin) return
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isAdmin])

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const id = href.replace("#", "")
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
    setIsMobileOpen(false)
  }, [])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  if (isAdmin) return null

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-background shadow-md border-b border-border/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, "#home")}
            className="relative z-[60] flex items-center gap-2"
          >
            <Image
              src="/logo-beharry.svg"
              alt="BeHarry"
              width={130}
              height={56}
              className={cn(
                "h-10 w-auto transition-all duration-300",
                isScrolled || isMobileOpen ? "" : "brightness-0 invert"
              )}
              priority
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 hover:text-primary",
                  isScrolled ? "text-foreground" : "text-background"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={cn(
              "relative z-[60] md:hidden transition-colors",
              isMobileOpen ? "text-foreground" : isScrolled ? "text-foreground" : "text-background"
            )}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Затвори меню" : "Отвори меню"}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={cn(
          "fixed inset-0 z-[55] flex flex-col items-center justify-center gap-6 bg-background transition-all duration-300 md:hidden",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute top-5 right-6 text-foreground"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Затвори меню"
        >
          <X className="h-7 w-7" />
        </button>

        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-serif text-2xl text-foreground transition-colors hover:text-primary"
            onClick={(e) => scrollToSection(e, link.href)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#reserve"
          className="mt-4 rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          onClick={(e) => scrollToSection(e, "#reserve")}
        >
          Резервирай
        </a>
      </div>
    </>
  )
}
