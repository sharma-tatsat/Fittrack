'use client'

import { 
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Mountain,
  RotateCw,
  Minus,
  CircleDot,
  Grip,
  type LucideIcon
} from 'lucide-react'
import { type MuscleGroup } from './store'

// Custom SVG icons for specific exercises
export function BenchPressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="11" width="4" height="2" rx="0.5" />
      <rect x="18" y="11" width="4" height="2" rx="0.5" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <circle cx="8" cy="12" r="3" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  )
}

export function SquatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v2" />
      <path d="M8 15l4-6 4 6" />
      <path d="M8 15v4" />
      <path d="M16 15v4" />
      <path d="M6 19h4" />
      <path d="M14 19h4" />
    </svg>
  )
}

export function DeadliftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4" />
      <path d="M8 10h8" />
      <circle cx="6" cy="10" r="2" />
      <circle cx="18" cy="10" r="2" />
      <path d="M12 10v6" />
      <path d="M9 20l3-4 3 4" />
    </svg>
  )
}

export function PullUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16" />
      <path d="M8 4v2" />
      <path d="M16 4v2" />
      <circle cx="12" cy="9" r="2" />
      <path d="M12 11v5" />
      <path d="M9 16l3-2 3 2" />
      <path d="M9 16v4" />
      <path d="M15 16v4" />
    </svg>
  )
}

export function CurlIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4v8" />
      <path d="M8 12h8" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M12 12c0 4-2 6-4 8" />
      <path d="M12 12c0 4 2 6 4 8" />
    </svg>
  )
}

export function CableIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="4" height="6" rx="1" />
      <rect x="16" y="2" width="4" height="6" rx="1" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
      <path d="M6 16c0 2 2 4 6 4s6-2 6-4" />
      <circle cx="12" cy="16" r="2" />
    </svg>
  )
}

export function LegPressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="8" width="6" height="8" rx="1" />
      <path d="M8 12h4" />
      <path d="M12 8l4 4-4 4" />
      <circle cx="18" cy="12" r="4" />
    </svg>
  )
}

export function ShoulderPressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8v2" />
      <path d="M8 10h8" />
      <path d="M6 10l-2-4" />
      <path d="M18 10l2-4" />
      <circle cx="4" cy="5" r="1.5" />
      <circle cx="20" cy="5" r="1.5" />
      <path d="M12 12v6" />
      <path d="M9 18h6" />
    </svg>
  )
}

export function PlankIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="4" cy="12" r="2" />
      <path d="M6 12h14" />
      <path d="M8 12l2 4" />
      <path d="M18 12l2 4" />
    </svg>
  )
}

export function LungeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4" />
      <path d="M8 10l4 4" />
      <path d="M12 14l4-4" />
      <path d="M8 14v6" />
      <path d="M16 10v10" />
    </svg>
  )
}

export function PushUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="10" r="2" />
      <path d="M8 10h10" />
      <path d="M10 10v6" />
      <path d="M16 10v6" />
      <path d="M4 16h4" />
      <path d="M16 16h4" />
    </svg>
  )
}

export function DipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4v8" />
      <path d="M20 4v8" />
      <path d="M4 8h4" />
      <path d="M16 8h4" />
      <circle cx="12" cy="8" r="2" />
      <path d="M12 10v4" />
      <path d="M10 14l2 6" />
      <path d="M14 14l-2 6" />
    </svg>
  )
}

export function CrunchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 10c2 4 6 4 8 1" />
      <path d="M16 11l2-2" />
      <path d="M8 10l-4 6" />
      <path d="M4 20h8" />
    </svg>
  )
}

export function CalfRaiseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4v12" />
      <path d="M8 8h8" />
      <path d="M10 16l-2 4" />
      <path d="M14 16l2 4" />
      <path d="M6 20h4" />
      <path d="M14 20h4" />
      <path d="M12 4l-2-2" />
      <path d="M12 4l2-2" />
    </svg>
  )
}

// Map exercise IDs to their icons
const exerciseIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Chest
  'bench-press': BenchPressIcon,
  'incline-press': BenchPressIcon,
  'cable-fly': CableIcon,
  'dumbbell-fly': Dumbbell as React.ComponentType<{ className?: string }>,
  'push-ups': PushUpIcon,
  
  // Back
  'pull-ups': PullUpIcon,
  'lat-pulldown': PullUpIcon,
  'deadlift': DeadliftIcon,
  'barbell-rows': BenchPressIcon,
  'cable-rows': CableIcon,
  
  // Legs
  'squats': SquatIcon,
  'leg-press': LegPressIcon,
  'lunges': LungeIcon,
  'leg-extensions': LegPressIcon,
  'leg-curls': LegPressIcon,
  'calf-raises': CalfRaiseIcon,
  
  // Shoulders
  'overhead-press': ShoulderPressIcon,
  'lateral-raises': ShoulderPressIcon,
  'front-raises': ShoulderPressIcon,
  'rear-delt-fly': CableIcon,
  
  // Arms
  'bicep-curls': CurlIcon,
  'hammer-curls': CurlIcon,
  'tricep-pushdowns': CableIcon,
  'tricep-dips': DipIcon,
  'skull-crushers': BenchPressIcon,
  
  // Core
  'crunches': CrunchIcon,
  'planks': PlankIcon,
  'leg-raises': LungeIcon,
  'russian-twists': RotateCw as React.ComponentType<{ className?: string }>,
  'mountain-climbers': Mountain as React.ComponentType<{ className?: string }>,
}

// Fallback icons by muscle group
const muscleGroupIcons: Record<MuscleGroup, React.ComponentType<{ className?: string }>> = {
  chest: BenchPressIcon,
  back: PullUpIcon,
  legs: SquatIcon,
  shoulders: ShoulderPressIcon,
  arms: CurlIcon,
  core: PlankIcon,
}

// Muscle group colors for more visual interest
export const muscleGroupColors: Record<MuscleGroup, { bg: string; text: string; border: string; gradient: string }> = {
  chest: { 
    bg: 'bg-rose-500/10', 
    text: 'text-rose-500', 
    border: 'border-rose-500/20',
    gradient: 'from-rose-500/20 to-rose-500/5'
  },
  back: { 
    bg: 'bg-blue-500/10', 
    text: 'text-blue-500', 
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/20 to-blue-500/5'
  },
  legs: { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-500', 
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-500/5'
  },
  shoulders: { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-500', 
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-500/5'
  },
  arms: { 
    bg: 'bg-violet-500/10', 
    text: 'text-violet-500', 
    border: 'border-violet-500/20',
    gradient: 'from-violet-500/20 to-violet-500/5'
  },
  core: { 
    bg: 'bg-orange-500/10', 
    text: 'text-orange-500', 
    border: 'border-orange-500/20',
    gradient: 'from-orange-500/20 to-orange-500/5'
  },
}

export function ExerciseIcon({ 
  exerciseId, 
  muscleGroup, 
  className = "w-5 h-5" 
}: { 
  exerciseId: string
  muscleGroup: MuscleGroup
  className?: string 
}) {
  const IconComponent = exerciseIconMap[exerciseId] || muscleGroupIcons[muscleGroup] || Dumbbell
  return <IconComponent className={className} />
}

export function getMuscleGroupColor(muscleGroup: MuscleGroup) {
  return muscleGroupColors[muscleGroup] || muscleGroupColors.chest
}
