import React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface AdminCardProps {
  children?: React.ReactNode
  className?: string
  /** Size (px) of the light travelling around the border. */
  beamSize?: number
  /** Seconds for one full lap around the card. */
  beamDuration?: number
  beamColorFrom?: string
  beamColorTo?: string
}

export function AdminCard({
  children,
  className,
  beamSize = 120,
  beamDuration = 10,
  beamColorFrom = "#9E7AFF",
  beamColorTo = "#FE8BBB",
}: AdminCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/50",
        className
      )}
    >
      {/* static top-edge hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
      />

      {/* orbiting border beam (border-only via mask) */}
      {!reduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
        >
          <motion.div
            className="absolute aspect-square bg-linear-to-l from-(--beam-from) via-(--beam-to) to-transparent"
            style={
              {
                width: beamSize,
                offsetPath: `rect(0 auto auto 0 round ${beamSize}px)`,
                "--beam-from": beamColorFrom,
                "--beam-to": beamColorTo,
              } as React.CSSProperties
            }
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: beamDuration,
            }}
          />
        </div>
      )}

      <div className="relative z-30">{children}</div>
    </div>
  )
}