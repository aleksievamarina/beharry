"use client"

import Image from "next/image"
import Link from "next/link"
import { PartyPopper, Users, Cake, Building2, Heart } from "lucide-react"

const eventTypes = [
  { icon: Cake, label: "Рождени дни" },
  { icon: Heart, label: "Моминско парти" },
  { icon: Building2, label: "Тиймбилдинг" },
  { icon: Users, label: "Фирмени събития" },
  { icon: PartyPopper, label: "Празници" },
]

export function EventsSection() {
  return (
    <section id="events" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/events-ceramic.jpg"
              alt="Празнувай с BeHarry"
              width={700}
              height={500}
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/10" />
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Събития
            </p>
            <h2 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
              <span className="text-balance">Празнувай с нас</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Оригинални креативни събития за всеки повод. Направи празника си незабравим с лична творба.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {eventTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.label}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {type.label}
                  </div>
                )
              })}
            </div>

            <div className="mt-10">
              <Link
                href="#reserve"
                className="inline-flex rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
              >
                Резервирай за събитие
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
