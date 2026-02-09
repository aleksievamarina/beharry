"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (el) {
      el.style.opacity = "0"
      el.style.transform = "translateY(40px)"
      requestAnimationFrame(() => {
        el.style.transition = "opacity 1s ease, transform 1s ease"
        el.style.opacity = "1"
        el.style.transform = "translateY(0)"
      })
    }
  }, [])

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/hero-ceramic.jpg"
        alt="Керамично студио BeHarry"
        fill
        className="object-cover"
        priority
        quality={90}
      />
      <div className="absolute inset-0 bg-foreground/60" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-background/80">
          Керамично студио в София
        </p>
        <h1
          ref={titleRef}
          className="font-serif text-5xl leading-tight text-background md:text-7xl lg:text-8xl"
        >
          <span className="text-balance">Нарисувай си сам керамика</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-background/85 md:text-xl">
          Избери форма, потопи се в цветове и създай лична магия &mdash; ние ще я направим вечна.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="#reserve"
            className="rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg"
          >
            Резервирай място
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border-2 border-background/40 px-10 py-4 text-lg font-semibold text-background transition-all hover:border-background hover:bg-background/10"
          >
            Научи повече
          </Link>
        </div>
      </div>

      <Link
        href="#how-it-works"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-background/70 transition-colors hover:text-background"
        aria-label="Скролни надолу"
      >
        <ChevronDown className="h-8 w-8" />
      </Link>
    </section>
  )
}
