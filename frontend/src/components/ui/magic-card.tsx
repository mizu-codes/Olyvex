import React, { useCallback, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

interface MagicCardProps {
  children?: React.ReactNode
  className?: string
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
  gradientFrom?: string
  gradientTo?: string
}

/**
 * Magic UI "Magic Card" (gradient mode), adapted for Vite + React.
 * - removed "use client" and next-themes (Olyvex is permanently dark)
 * - orb mode dropped: unused, and it was the only consumer of the theme hook
 */
export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = "#262626",
  gradientOpacity = 0.6,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)
  const sizeRef = useRef(gradientSize)

  useEffect(() => {
    sizeRef.current = gradientSize
  }, [gradientSize])

  const reset = useCallback(() => {
    mouseX.set(-sizeRef.current)
    mouseY.set(-sizeRef.current)
  }, [mouseX, mouseY])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  useEffect(() => {
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset()
    }
    const onVisibility = () => {
      if (document.visibilityState !== "visible") reset()
    }
    window.addEventListener("pointerout", onOut)
    window.addEventListener("blur", reset)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("pointerout", onOut)
      window.removeEventListener("blur", reset)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reset])

  const borderBackground = useMotionTemplate`
    linear-gradient(var(--color-card) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--color-border) 100%
    ) border-box
  `

  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl border border-transparent shadow-2xl shadow-black/50",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ background: borderBackground }}
    >
      <div className="bg-card absolute inset-px z-20 rounded-[inherit]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight, opacity: gradientOpacity }}
      />
      <div className="relative z-40">{children}</div>
    </motion.div>
  )
}