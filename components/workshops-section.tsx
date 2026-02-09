"use client"

import Image from "next/image"
import { Brush, Diamond, Frame, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"

const workshops = [
  {
    icon: Brush,
    title: "Глина",
    description: "Моделирай нещо неповторимо с ръцете си. Подходящо за начинаещи и напреднали.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Diamond,
    title: "Стъкло",
    description: "Създай уникален декоративен предмет от стъкло. Техника фюзинг.",
    accent: "bg-accent text-accent-foreground",
  },
  {
    icon: Frame,
    title: "Картина",
    description: "Нарисувай платно за дома си с професионално ръководство.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Scissors,
    title: "Тафтинг",
    description: "Създай пухкаво килимче или цветно пано по свой дизайн.",
    accent: "bg-accent text-accent-foreground",
  },
]

export function WorkshopsSection() {
  return (
    <section className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Работилници</p>
            <h2 className="mt-3 font-serif text-4xl text-foreground md:text-5xl">
              <span className="text-balance">Workshops</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Не само керамика - разкрий нови таланти с нашите творчески работилници.
            </p>

            <div className="mt-8 space-y-4">
              {workshops.map((w) => {
                const Icon = w.icon
                return (
                  <div
                    key={w.title}
                    className="group flex items-start gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", w.accent)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{w.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/workshop-ceramic.jpg"
              alt="Работилница в BeHarry"
              width={700}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
