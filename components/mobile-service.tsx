"use client"

import { Truck, Clock, Smile, Building2 } from "lucide-react"

const features = [
  { icon: Clock, text: "2 часа творчество" },
  { icon: Smile, text: "Много идеи и усмивки" },
  { icon: Building2, text: "Идваме в офиса" },
  { icon: Truck, text: "Или на градинското ти парти" },
]

export function MobileService() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-primary" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
          На път
        </p>
        <h2 className="mt-3 font-serif text-4xl text-primary-foreground md:text-5xl">
          <span className="text-balance">Harry on the way</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
          Не можеш да дойдеш при нас? Ние ще дойдем при теб! Организираме творчески сесии на локация по твой избор.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.text} className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-primary-foreground">{f.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
