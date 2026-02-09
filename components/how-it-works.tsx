"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: "/steps/step-1.svg",
    title: "Избери керамика",
    description: "Чинии, чаши, вази, фигурки - каквото пожелаеш.",
    hoverText: "Чаши, чинии, купи, фигурки и много други красиви форми, готови за декорации.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: true,
  },
  {
    icon: "/steps/step-2.svg",
    title: "Избери цветове",
    description: "Над 50 цвята на твое разположение.",
    hoverText: "Повече от 100 цвята подглазурни бои и техники, комбинирай свободно и създай твоето уникално нещо.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: false,
  },
  {
    icon: "/steps/step-3.svg",
    title: "Нарисувай нещо",
    description: "Дай воля на въображението си - няма правила!",
    hoverText: "Време за рисуване - от прости шарки до по-сложни рисунки, не е нужно да си художник.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: false,
  },
  {
    icon: "/steps/step-4.svg",
    title: "После ще глазираме",
    description: "Професионално глазиране за дълготрайност.",
    hoverText: "След рисуването, изделието се покрива със защитна прозрачна глазура за завършен вид.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: false,
  },
  {
    icon: "/steps/step-5.svg",
    title: "Остави ни да изпечем",
    description: "Твоето изделие се пече на 1000+ градуса.",
    hoverText: "Творбата се изпича в пещ на 1100\u00B0C, което фиксира цветовете и ги прави устойчиви.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: false,
  },
  {
    icon: "/steps/step-6.svg",
    title: "Вземи своето изделие",
    description: "Готово за 7-10 дни - уникално и твое!",
    hoverText: "При изпичането на 1040\u00B0C цветовете се запечатват и остават ярки и устойчиви.",
    hoverBg: "bg-[#D4593E]",
    hoverText_color: "text-white",
    hoverSub_color: "text-white/80",
    hoverBorder_color: "border-white",
    hoverIcon: false,
  },
]

export function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setVisibleSteps((prev) => (prev.includes(index) ? prev : [...prev, index]))
          }
        }
      },
      { threshold: 0.3 }
    )

    for (const ref of stepsRef.current) {
      if (ref) observer.observe(ref)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-[#3D2B1F]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#D4593E]">Процес</p>
          <h2 className="mt-3 font-serif text-4xl text-[#F5F0EB] md:text-5xl">
            <span className="text-balance">Как работи?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[#C4B8AC]">
            Шест прости стъпки до твоето уникално керамично изделие
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              ref={(el) => { stepsRef.current[i] = el }}
              data-index={i}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl bg-[#F5F0EB] p-8 transition-all duration-700 hover:shadow-xl",
                visibleSteps.includes(i)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Hover overlay */}
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-500 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 z-10 rounded-2xl",
                step.hoverBg
              )}>
                {/* Step number on hover */}
                <div className={cn(
                  "absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  step.hoverBorder_color,
                  step.hoverText_color
                )}>
                  {i + 1}
                </div>

                <h3 className={cn("text-lg font-semibold mb-3", step.hoverText_color)}>{step.title}</h3>
                <p className={cn("text-sm leading-relaxed max-w-[220px]", step.hoverSub_color)}>{step.hoverText}</p>
              </div>

              {/* Default content */}
              {/* Step number */}
              <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3D2B1F] text-sm font-bold text-[#3D2B1F]">
                {i + 1}
              </div>

              {/* Icon */}
              <div className="flex justify-center py-4">
                <Image
                  src={step.icon || "/placeholder.svg"}
                  alt={step.title}
                  width={86}
                  height={87}
                  className="h-20 w-20 object-contain"
                />
              </div>

              {/* Text */}
              <div className="mt-2 text-center">
                <h3 className="text-lg font-semibold text-[#3D2B1F]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B5B4F]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
