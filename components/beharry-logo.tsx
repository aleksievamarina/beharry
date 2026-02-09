"use client"

import { cn } from "@/lib/utils"

interface BeHarryLogoProps {
  className?: string
  dark?: boolean
}

export function BeHarryLogo({ className, dark = false }: BeHarryLogoProps) {
  const petalColor = dark ? "#D4593E" : "#D4593E"
  const textColor = dark ? "#3D2B1F" : "#FAF6F1"
  const faceColor = "#FAF6F1"
  const featureColor = dark ? "#3D2B1F" : "#3D2B1F"

  return (
    <svg
      viewBox="0 0 200 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-auto", className)}
      aria-label="BeHarry logo"
    >
      {/* Flower / sheep mane petals */}
      <circle cx="35" cy="14" r="12" fill={petalColor} />
      <circle cx="18" cy="20" r="12" fill={petalColor} />
      <circle cx="52" cy="20" r="12" fill={petalColor} />
      <circle cx="14" cy="37" r="12" fill={petalColor} />
      <circle cx="56" cy="37" r="12" fill={petalColor} />
      <circle cx="20" cy="52" r="12" fill={petalColor} />
      <circle cx="50" cy="52" r="12" fill={petalColor} />
      <circle cx="35" cy="56" r="12" fill={petalColor} />

      {/* Sheep face */}
      <circle cx="35" cy="36" r="16" fill={faceColor} />

      {/* Closed eyes - cute arcs */}
      <path
        d="M27 33 C28 30, 31 30, 32 33"
        stroke={featureColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M38 33 C39 30, 42 30, 43 33"
        stroke={featureColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small smile */}
      <path
        d="M33 40 C34 42, 36 42, 37 40"
        stroke={featureColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Text: "be" */}
      <text
        x="78"
        y="30"
        fill={textColor}
        fontFamily="var(--font-dm-serif), Georgia, serif"
        fontSize="24"
        fontWeight="400"
      >
        be
      </text>

      {/* Text: "harry" */}
      <text
        x="78"
        y="56"
        fill={textColor}
        fontFamily="var(--font-dm-serif), Georgia, serif"
        fontSize="24"
        fontWeight="400"
      >
        harry
      </text>
    </svg>
  )
}
