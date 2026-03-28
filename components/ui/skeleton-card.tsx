'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-2xl bg-card border border-border p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
          <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
        </div>
      </div>
    </motion.div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-secondary rounded animate-pulse w-12" />
              <div className="h-3 bg-secondary rounded animate-pulse w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
