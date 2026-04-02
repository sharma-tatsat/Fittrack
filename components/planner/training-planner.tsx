'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Plus, 
  GripVertical,
  X,
  Calendar,
  Trash2,
  ChevronDown,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Coffee,
  Edit3,
  AlertTriangle,
  Check,
  Timer,
  Save,
  Loader2
} from 'lucide-react'
import { useFitnessStore, type Exercise } from '@/lib/store'
import { ExerciseIcon, getMuscleGroupColor } from '@/lib/exercise-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format, isBefore, startOfDay } from 'date-fns'
import { Calendar as CalendarWidget } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ─── Default Plan Templates (reference exercises by name) ───────────

interface PlanTemplate {
  id: string
  name: string
  description: string
  days: { day: string; exerciseNames: string[] }[]
}

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: '6 days — classic PPL, each hit twice per week',
    days: [
      { day: 'Monday', exerciseNames: ['Bench Press', 'Incline Press', 'Cable Fly', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdowns'] },
      { day: 'Tuesday', exerciseNames: ['Pull Ups', 'Barbell Rows', 'Lat Pulldown', 'Cable Rows', 'Bicep Curls', 'Hammer Curls'] },
      { day: 'Wednesday', exerciseNames: ['Squats', 'Leg Press', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Thursday', exerciseNames: ['Incline Press', 'Dumbbell Fly', 'Overhead Press', 'Front Raises', 'Tricep Dips', 'Skull Crushers'] },
      { day: 'Friday', exerciseNames: ['Deadlift', 'Pull Ups', 'Cable Rows', 'Lat Pulldown', 'Bicep Curls', 'Hammer Curls'] },
      { day: 'Saturday', exerciseNames: ['Squats', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    description: '4 days — alternating upper and lower body',
    days: [
      { day: 'Monday', exerciseNames: ['Bench Press', 'Barbell Rows', 'Overhead Press', 'Lat Pulldown', 'Bicep Curls', 'Tricep Pushdowns'] },
      { day: 'Tuesday', exerciseNames: ['Squats', 'Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'] },
      { day: 'Wednesday', exerciseNames: [] },
      { day: 'Thursday', exerciseNames: ['Incline Press', 'Cable Rows', 'Lateral Raises', 'Pull Ups', 'Hammer Curls', 'Skull Crushers'] },
      { day: 'Friday', exerciseNames: ['Squats', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Saturday', exerciseNames: [] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
  {
    id: 'bro-split',
    name: 'Bro Split',
    description: '5 days — one muscle group per day',
    days: [
      { day: 'Monday', exerciseNames: ['Bench Press', 'Incline Press', 'Cable Fly', 'Dumbbell Fly', 'Push Ups'] },
      { day: 'Tuesday', exerciseNames: ['Pull Ups', 'Barbell Rows', 'Lat Pulldown', 'Cable Rows', 'Deadlift'] },
      { day: 'Wednesday', exerciseNames: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly'] },
      { day: 'Thursday', exerciseNames: ['Squats', 'Leg Press', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Friday', exerciseNames: ['Bicep Curls', 'Hammer Curls', 'Tricep Pushdowns', 'Tricep Dips', 'Skull Crushers'] },
      { day: 'Saturday', exerciseNames: [] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: '3 days — full body each session, great for beginners',
    days: [
      { day: 'Monday', exerciseNames: ['Squats', 'Bench Press', 'Barbell Rows', 'Overhead Press', 'Bicep Curls', 'Planks'] },
      { day: 'Tuesday', exerciseNames: [] },
      { day: 'Wednesday', exerciseNames: ['Deadlift', 'Incline Press', 'Pull Ups', 'Lateral Raises', 'Tricep Pushdowns', 'Leg Raises'] },
      { day: 'Thursday', exerciseNames: [] },
      { day: 'Friday', exerciseNames: ['Leg Press', 'Dumbbell Fly', 'Cable Rows', 'Overhead Press', 'Hammer Curls', 'Crunches'] },
      { day: 'Saturday', exerciseNames: [] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
  {
    id: 'arnold',
    name: 'Arnold Split',
    description: '6 days — chest/back, shoulders/arms, legs rotation',
    days: [
      { day: 'Monday', exerciseNames: ['Bench Press', 'Incline Press', 'Dumbbell Fly', 'Pull Ups', 'Barbell Rows', 'Cable Rows'] },
      { day: 'Tuesday', exerciseNames: ['Overhead Press', 'Lateral Raises', 'Rear Delt Fly', 'Bicep Curls', 'Hammer Curls', 'Tricep Pushdowns', 'Skull Crushers'] },
      { day: 'Wednesday', exerciseNames: ['Squats', 'Leg Press', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Thursday', exerciseNames: ['Bench Press', 'Cable Fly', 'Deadlift', 'Lat Pulldown', 'Barbell Rows'] },
      { day: 'Friday', exerciseNames: ['Overhead Press', 'Front Raises', 'Lateral Raises', 'Bicep Curls', 'Tricep Dips', 'Hammer Curls'] },
      { day: 'Saturday', exerciseNames: ['Squats', 'Leg Press', 'Leg Extensions', 'Leg Curls', 'Calf Raises', 'Mountain Climbers'] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
  {
    id: 'phat',
    name: 'PHUL (Power / Hypertrophy)',
    description: '4 days — power upper/lower + hypertrophy upper/lower',
    days: [
      { day: 'Monday', exerciseNames: ['Bench Press', 'Barbell Rows', 'Overhead Press', 'Pull Ups', 'Bicep Curls', 'Tricep Dips'] },
      { day: 'Tuesday', exerciseNames: ['Squats', 'Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'] },
      { day: 'Wednesday', exerciseNames: [] },
      { day: 'Thursday', exerciseNames: ['Incline Press', 'Cable Fly', 'Lat Pulldown', 'Cable Rows', 'Lateral Raises', 'Hammer Curls', 'Tricep Pushdowns'] },
      { day: 'Friday', exerciseNames: ['Squats', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'] },
      { day: 'Saturday', exerciseNames: [] },
      { day: 'Sunday', exerciseNames: [] },
    ],
  },
]

const dayConfig: Record<string, { icon: typeof Sun; color: string }> = {
  Monday: { icon: Zap, color: 'text-blue-500' },
  Tuesday: { icon: Zap, color: 'text-emerald-500' },
  Wednesday: { icon: Zap, color: 'text-amber-500' },
  Thursday: { icon: Zap, color: 'text-violet-500' },
  Friday: { icon: Zap, color: 'text-rose-500' },
  Saturday: { icon: Sun, color: 'text-orange-500' },
  Sunday: { icon: Coffee, color: 'text-cyan-500' },
}

const SPLIT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Push:              { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/25' },
  Pull:              { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/25' },
  Legs:              { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/25' },
  Upper:             { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/25' },
  Lower:             { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/25' },
  Chest:             { bg: 'bg-red-500/10',     text: 'text-red-500',     border: 'border-red-500/25' },
  Back:              { bg: 'bg-sky-500/10',     text: 'text-sky-500',     border: 'border-sky-500/25' },
  Shoulders:         { bg: 'bg-orange-500/10',  text: 'text-orange-500',  border: 'border-orange-500/25' },
  Arms:              { bg: 'bg-pink-500/10',    text: 'text-pink-500',    border: 'border-pink-500/25' },
  Core:              { bg: 'bg-teal-500/10',    text: 'text-teal-500',    border: 'border-teal-500/25' },
  'Full Body':       { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  border: 'border-indigo-500/25' },
  'Chest / Back':    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500', border: 'border-fuchsia-500/25' },
  'Shoulders / Arms':{ bg: 'bg-lime-500/10',    text: 'text-lime-500',    border: 'border-lime-500/25' },
}
const DEFAULT_SPLIT_COLOR = { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/20' }

// ─── Split presets: split label → exercise names ───────────────────
const SPLIT_PRESETS: Record<string, string[]> = {
  Push: ['Bench Press', 'Incline Press', 'Cable Fly', 'Overhead Press', 'Lateral Raises', 'Tricep Pushdowns'],
  Pull: ['Pull Ups', 'Barbell Rows', 'Lat Pulldown', 'Cable Rows', 'Bicep Curls', 'Hammer Curls'],
  Legs: ['Squats', 'Leg Press', 'Lunges', 'Leg Extensions', 'Leg Curls', 'Calf Raises'],
  Upper: ['Bench Press', 'Barbell Rows', 'Overhead Press', 'Lat Pulldown', 'Bicep Curls', 'Tricep Pushdowns'],
  Lower: ['Squats', 'Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'],
  Chest: ['Bench Press', 'Incline Press', 'Cable Fly', 'Dumbbell Fly', 'Push Ups'],
  Back: ['Pull Ups', 'Barbell Rows', 'Lat Pulldown', 'Cable Rows', 'Deadlift'],
  Shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly'],
  Arms: ['Bicep Curls', 'Hammer Curls', 'Tricep Pushdowns', 'Tricep Dips', 'Skull Crushers'],
  Core: ['Crunches', 'Planks', 'Leg Raises', 'Russian Twists', 'Mountain Climbers'],
  'Full Body': ['Squats', 'Bench Press', 'Barbell Rows', 'Overhead Press', 'Bicep Curls', 'Planks'],
  'Chest / Back': ['Bench Press', 'Incline Press', 'Dumbbell Fly', 'Pull Ups', 'Barbell Rows', 'Cable Rows'],
  'Shoulders / Arms': ['Overhead Press', 'Lateral Raises', 'Rear Delt Fly', 'Bicep Curls', 'Hammer Curls', 'Tricep Pushdowns', 'Skull Crushers'],
}

const SPLIT_OPTIONS = Object.keys(SPLIT_PRESETS)

// Map each template to the split labels its training days use
const TEMPLATE_SPLITS: Record<string, string[]> = {
  ppl: ['Push', 'Pull', 'Legs'],
  'upper-lower': ['Upper', 'Lower'],
  'bro-split': ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'],
  'full-body': ['Full Body'],
  arnold: ['Chest / Back', 'Shoulders / Arms', 'Legs'],
  phat: ['Upper', 'Lower'],
}

function SortableExerciseItem({ 
  exercise, 
  onRemove 
}: { 
  exercise: Exercise
  onRemove: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-2 p-3 rounded-xl bg-secondary/30 group border border-transparent hover:border-border/50 transition-all",
        isDragging && "opacity-50 scale-105"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        colorConfig.bg
      )}>
        <ExerciseIcon 
          exerciseId={exercise.id}
          muscleGroup={exercise.muscleGroup}
          className={cn("w-4 h-4", colorConfig.text)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{exercise.name}</span>
        <span className={cn("text-xs capitalize", colorConfig.text)}>{exercise.muscleGroup}</span>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default TrainingPlanner;

function DraggableExerciseOverlay({ exercise }: { exercise: Exercise }) {
  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)
  
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-card border-2 border-primary/50 shadow-xl shadow-primary/20">
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center",
        colorConfig.bg
      )}>
        <ExerciseIcon 
          exerciseId={exercise.id}
          muscleGroup={exercise.muscleGroup}
          className={cn("w-4 h-4", colorConfig.text)}
        />
      </div>
      <span className="text-sm font-medium">{exercise.name}</span>
    </div>
  )
}

export function TrainingPlanner() {
  const { 
    exercises, 
    trainingPlans, 
    activeTrainingPlanId, 
    updateTrainingPlan,
    saveTrainingPlan,
    addTrainingPlan,
    deleteTrainingPlan,
    setActiveTrainingPlan,
    planDirty
  } = useFitnessStore()
  const [isSaving, setIsSaving] = useState(false)
  
  const [expandedDay, setExpandedDay] = useState<string | null>('Monday')
  const [isAddingPlan, setIsAddingPlan] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [restDays, setRestDays] = useState<Set<string>>(new Set(['Saturday', 'Sunday']))
  const [planWeeks, setPlanWeeks] = useState(0)
  const [durationMode, setDurationMode] = useState<'ongoing' | 'weeks' | 'months' | 'years'>('ongoing')
  const [durationValue, setDurationValue] = useState('')
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [isEditingDuration, setIsEditingDuration] = useState(false)
  const [planStartDate, setPlanStartDate] = useState<Date>(new Date())
  const [addExerciseDialog, setAddExerciseDialog] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false)
  const [confirmRestDay, setConfirmRestDay] = useState<string | null>(null)

  const activePlan = trainingPlans.find(p => p.id === activeTrainingPlanId)

  // Convert duration inputs to weeks
  const computeWeeks = (mode: typeof durationMode, val: string): number => {
    const n = parseInt(val) || 0
    if (mode === 'ongoing' || n <= 0) return 0
    if (mode === 'weeks') return Math.min(n, 52)
    if (mode === 'months') return Math.min(n, 24) * 4
    if (mode === 'years') return Math.min(n, 10) * 52
    return 0
  }

  const durationPresets: Record<string, number[]> = {
    weeks: [4, 6, 8, 10, 12, 16],
    months: [1, 2, 3, 6, 9, 12],
    years: [1, 2, 3, 5],
  }

  const durationMax: Record<string, number> = { weeks: 52, months: 24, years: 10 }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent, day: string) => {
    setActiveId(null)
    const { active, over } = event

    if (over && active.id !== over.id && activePlan) {
      const dayPlan = activePlan.days.find(d => d.day === day)
      if (!dayPlan) return

      const oldIndex = dayPlan.exercises.indexOf(active.id as string)
      const newIndex = dayPlan.exercises.indexOf(over.id as string)

      const newExercises = arrayMove(dayPlan.exercises, oldIndex, newIndex)

      updateTrainingPlan(activePlan.id, {
        days: activePlan.days.map(d =>
          d.day === day ? { ...d, exercises: newExercises } : d
        )
      })

      // Immediately persist the new order to the backend
      setTimeout(() => {
        if (activePlan) saveTrainingPlan(activePlan.id)
      }, 0)
    }
  }

  const handleAddExercise = (day: string, exerciseId: string) => {
    if (!activePlan) return
    
    updateTrainingPlan(activePlan.id, {
      days: activePlan.days.map(d => 
        d.day === day 
          ? { ...d, exercises: [...d.exercises, exerciseId] } 
          : d
      )
    })
    setAddExerciseDialog(null)
    setExerciseSearch('')
  }

  const handleRemoveExercise = (day: string, exerciseId: string) => {
    if (!activePlan) return
    
    updateTrainingPlan(activePlan.id, {
      days: activePlan.days.map(d => 
        d.day === day 
          ? { ...d, exercises: d.exercises.filter(e => e !== exerciseId) } 
          : d
      )
    })
  }

  const selectedTemplateObj = selectedTemplate
    ? PLAN_TEMPLATES.find(t => t.id === selectedTemplate) ?? null
    : null

  const toggleRestDay = (day: string) => {
    setRestDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  const handleCreatePlan = () => {
    const name = newPlanName.trim()
    if (!name) return

    const weeks = computeWeeks(durationMode, durationValue)
    const startDateStr = format(planStartDate, 'yyyy-MM-dd')

    if (selectedTemplateObj) {
      // Collect exercise slots from template's training days (days that have exercises)
      const templateTrainingDays = selectedTemplateObj.days.filter(td => td.exerciseNames.length > 0)
      const exerciseSlots = templateTrainingDays.map(td =>
        td.exerciseNames
          .map(eName => exercises.find(e => e.name === eName)?.id)
          .filter((id): id is string => !!id)
      )

      // User's selected training days (non-rest) in DAYS order
      const userTrainingDays = DAYS.filter(d => !restDays.has(d))

      // Redistribute exercise slots to user's training days in order
      const resolvedDays = DAYS.map(day => {
        if (restDays.has(day)) {
          return { day, isRest: true, exercises: [] as string[] }
        }
        const slotIndex = userTrainingDays.indexOf(day)
        const exercises = slotIndex < exerciseSlots.length ? exerciseSlots[slotIndex] : []
        return { day, isRest: false, exercises }
      })

      addTrainingPlan({
        name,
        durationWeeks: weeks,
        startDate: startDateStr,
        days: resolvedDays,
      })
    } else {
      addTrainingPlan({
        name,
        durationWeeks: weeks,
        startDate: startDateStr,
        days: DAYS.map(day => ({ day, exercises: [], isRest: restDays.has(day) })),
      })
    }

    setNewPlanName('')
    setSelectedTemplate(null)
    setRestDays(new Set(['Saturday', 'Sunday']))
    setDurationMode('ongoing')
    setDurationValue('')
    setIsCustomDuration(false)
    setPlanWeeks(0)
    setPlanStartDate(new Date())
    setIsAddingPlan(false)
  }

  const handleToggleRestDayOnPlan = (day: string) => {
    if (!activePlan) return
    const dayPlan = activePlan.days.find(d => d.day === day)
    if (!dayPlan) return

    const isBecomingRest = !dayPlan.isRest

    // Collect exercise arrays from ALL current training days in DAYS order
    const currentTrainingDays = DAYS.filter(d => {
      const dp = activePlan.days.find(p => p.day === d)
      return dp && !dp.isRest && dp.exercises.length > 0
    })
    const exerciseSlots = currentTrainingDays.map(d => activePlan.days.find(p => p.day === d)!.exercises)

    if (isBecomingRest) {
      // Start with existing training days minus the one becoming rest
      const newTrainingDays = DAYS.filter(d => {
        if (d === day) return false
        const dp = activePlan.days.find(p => p.day === d)
        return dp && !dp.isRest
      })

      // Auto-promote rest days to absorb overflowing exercise slots
      const availableRestDays = DAYS.filter(d => {
        if (d === day) return false
        return !newTrainingDays.includes(d)
      })

      while (newTrainingDays.length < exerciseSlots.length && availableRestDays.length > 0) {
        const lastTraining = newTrainingDays[newTrainingDays.length - 1]
        const lastIdx = DAYS.indexOf(lastTraining)
        let promoted: string | null = null
        for (let i = 1; i <= 7; i++) {
          const candidate = DAYS[(lastIdx + i) % 7]
          const avIdx = availableRestDays.indexOf(candidate)
          if (avIdx !== -1) {
            promoted = candidate
            availableRestDays.splice(avIdx, 1)
            break
          }
        }
        if (promoted) {
          newTrainingDays.push(promoted)
          newTrainingDays.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
        } else {
          break
        }
      }

      updateTrainingPlan(activePlan.id, {
        days: activePlan.days.map(d => {
          if (d.day === day) return { ...d, exercises: [], isRest: true }
          const slotIndex = newTrainingDays.indexOf(d.day)
          if (slotIndex !== -1 && slotIndex < exerciseSlots.length) {
            return { ...d, exercises: exerciseSlots[slotIndex], isRest: false }
          }
          if (slotIndex !== -1) {
            return { ...d, exercises: [], isRest: false }
          }
          return d
        }),
      })
    } else {
      // Becoming training day — redistribute with the new day included
      const newTrainingDays = DAYS.filter(d => {
        if (d === day) return true
        const dp = activePlan.days.find(p => p.day === d)
        return dp && !dp.isRest
      })

      updateTrainingPlan(activePlan.id, {
        days: activePlan.days.map(d => {
          if (d.isRest && d.day !== day) return d
          const slotIndex = newTrainingDays.indexOf(d.day)
          const exercises = slotIndex < exerciseSlots.length ? exerciseSlots[slotIndex] : []
          return { ...d, exercises, isRest: false }
        }),
      })
    }
    // Auto-save rest day toggle
    setTimeout(() => saveTrainingPlan(activePlan.id), 0)
  }

  const handleSaveScheduleEdit = () => {
    if (!activePlan) return

    // Collect exercise arrays from current training (non-rest) days in DAYS order
    const currentTrainingDays = DAYS.filter(d => {
      const dayPlan = activePlan.days.find(dp => dp.day === d)
      return dayPlan && !dayPlan.isRest && dayPlan.exercises.length > 0
    })
    const exerciseSlots = currentTrainingDays.map(d => {
      const dayPlan = activePlan.days.find(dp => dp.day === d)!
      return dayPlan.exercises
    })

    // New training days in DAYS order
    const newTrainingDays = DAYS.filter(d => !restDays.has(d))

    // Redistribute: assign exercise arrays to new training days in order
    updateTrainingPlan(activePlan.id, {
      days: activePlan.days.map(d => {
        if (restDays.has(d.day)) {
          return { ...d, exercises: [], isRest: true }
        }
        const slotIndex = newTrainingDays.indexOf(d.day)
        const exercises = slotIndex < exerciseSlots.length ? exerciseSlots[slotIndex] : []
        return { ...d, exercises, isRest: false }
      }),
    })
    setIsEditingSchedule(false)
    if (activePlan.id) saveTrainingPlan(activePlan.id)
  }

  const handleChangeSplit = (day: string, splitLabel: string) => {
    if (!activePlan) return
    const presetNames = SPLIT_PRESETS[splitLabel]
    if (!presetNames) return
    const resolvedIds = presetNames
      .map(name => exercises.find(e => e.name === name)?.id)
      .filter((id): id is string => !!id)
    updateTrainingPlan(activePlan.id, {
      days: activePlan.days.map(d =>
        d.day === day ? { ...d, exercises: resolvedIds, isRest: false } : d
      ),
    })
    // Save immediately — split change is an explicit action
    setTimeout(() => saveTrainingPlan(activePlan.id), 0)
  }

  const handleSaveDurationEdit = () => {
    if (!activePlan) return
    const weeks = computeWeeks(durationMode, durationValue)
    updateTrainingPlan(activePlan.id, {
      durationWeeks: weeks,
      startDate: format(planStartDate, 'yyyy-MM-dd'),
    })
    setIsEditingDuration(false)
    saveTrainingPlan(activePlan.id)
  }

  const activeExercise = activeId ? exercises.find(e => e.id === activeId) : null

  // Derive a split label from the muscle groups of exercises on a day
  const getSplitLabel = (exerciseIds: string[]): string | null => {
    if (exerciseIds.length === 0) return null
    const groups = new Set(
      exerciseIds
        .map(id => exercises.find(e => e.id === id)?.muscleGroup)
        .filter(Boolean)
    )
    const has = (...gs: string[]) => gs.some(g => groups.has(g as never))
    const isUpper = has('chest', 'back', 'shoulders', 'arms') && !has('legs')
    const isLower = has('legs') && !has('chest', 'back', 'shoulders')
    const isPush = has('chest', 'shoulders') && !has('back', 'legs')
    const isPull = has('back') && !has('chest', 'legs')
    const isLegs = has('legs') && groups.size <= 2
    const isArms = has('arms') && groups.size <= 2
    if (isPush) return 'Push'
    if (isPull) return 'Pull'
    if (isLegs) return 'Legs'
    if (isArms) return 'Arms'
    if (isUpper) return 'Upper'
    if (isLower) return 'Lower'
    if (groups.size >= 4) return 'Full Body'
    return [...groups].map(g => (g as string).charAt(0).toUpperCase() + (g as string).slice(1)).join(' / ')
  }

  // Compute which split options to show based on what's in the plan
  const planSplitOptions = (() => {
    if (!activePlan) return SPLIT_OPTIONS
    // Collect all distinct split labels currently in the plan
    const labels = new Set<string>()
    for (const d of activePlan.days) {
      if (!d.isRest && d.exercises.length > 0) {
        const label = getSplitLabel(d.exercises)
        if (label) labels.add(label)
      }
    }
    // Check if these labels match a known template's split set
    for (const [, templateSplits] of Object.entries(TEMPLATE_SPLITS)) {
      const tSet = new Set(templateSplits)
      if (labels.size > 0 && [...labels].every(l => tSet.has(l))) {
        return templateSplits
      }
    }
    // Fallback: show all unique labels from the plan + rest of SPLIT_OPTIONS
    if (labels.size > 0) return [...labels]
    return SPLIT_OPTIONS
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Training Planner
            <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground">Create and customize your workout split</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={activeTrainingPlanId || ''}
            onValueChange={setActiveTrainingPlan}
          >
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {trainingPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {planDirty && activePlan && (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5 shadow-lg shadow-primary/20"
              disabled={isSaving}
              onClick={async () => {
                if (!activePlan) return
                setIsSaving(true)
                await saveTrainingPlan(activePlan.id)
                setIsSaving(false)
              }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          )}
          <Dialog open={isAddingPlan} onOpenChange={(open) => { setIsAddingPlan(open); if (!open) { setSelectedTemplate(null); setNewPlanName(''); setRestDays(new Set(['Saturday', 'Sunday'])); setPlanWeeks(0); setDurationMode('ongoing'); setDurationValue(''); setIsCustomDuration(false); setPlanStartDate(new Date()); } }}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create New Plan
                </DialogTitle>
                <DialogDescription>
                  Pick a template or start from scratch.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* Template selector */}
                <Select
                  value={selectedTemplate ?? 'blank'}
                  onValueChange={(val) => {
                    if (val === 'blank') {
                      setSelectedTemplate(null)
                      setNewPlanName('')
                      setRestDays(new Set(['Saturday', 'Sunday']))
                    } else {
                      setSelectedTemplate(val)
                      const tpl = PLAN_TEMPLATES.find(t => t.id === val)
                      if (tpl) {
                        setNewPlanName(tpl.name)
                        // Pre-fill rest days from template
                        setRestDays(new Set(tpl.days.filter(d => d.exerciseNames.length === 0).map(d => d.day)))
                      }
                    }
                  }}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">Blank Plan</SelectItem>
                    {PLAN_TEMPLATES.map(tpl => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Template description */}
                {selectedTemplateObj && (
                  <p className="text-sm text-muted-foreground">{selectedTemplateObj.description}</p>
                )}

                {/* Day toggles — always visible */}
                <div>
                  <p className="text-sm font-medium mb-2">Workout / Rest days</p>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map(day => {
                      const isRest = restDays.has(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRestDay(day)}
                          className={cn(
                            "flex flex-col items-center gap-0.5 rounded-lg py-2 px-1 text-xs font-medium transition-all border",
                            isRest
                              ? "bg-secondary/50 text-muted-foreground border-transparent"
                              : "bg-primary/10 text-primary border-primary/30"
                          )}
                        >
                          <span>{day.slice(0, 3)}</span>
                          <span className="text-[10px]">{isRest ? 'Rest' : 'Train'}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Plan name */}
                <Input
                  placeholder="Plan name"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="bg-secondary/50"
                />

                {/* Duration picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Duration</p>
                  <div className="flex gap-2">
                    <Select
                      value={durationMode}
                      onValueChange={(val: 'ongoing' | 'weeks' | 'months' | 'years') => {
                        setDurationMode(val)
                        setDurationValue('')
                        setIsCustomDuration(false)
                      }}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                    {durationMode !== 'ongoing' && !isCustomDuration && (
                      <Select
                        value={durationValue || ''}
                        onValueChange={(val) => {
                          if (val === 'custom') {
                            setIsCustomDuration(true)
                            setDurationValue('')
                          } else {
                            setDurationValue(val)
                          }
                        }}
                      >
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder={`Select ${durationMode}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {durationPresets[durationMode].map(v => (
                            <SelectItem key={v} value={String(v)}>
                              {v} {durationMode}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {durationMode !== 'ongoing' && isCustomDuration && (
                      <div className="flex gap-2 flex-1">
                        <Input
                          type="number"
                          placeholder={`Max ${durationMax[durationMode]}`}
                          value={durationValue}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0
                            setDurationValue(v > durationMax[durationMode] ? String(durationMax[durationMode]) : e.target.value)
                          }}
                          min={1}
                          max={durationMax[durationMode]}
                          className="bg-secondary/50 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setIsCustomDuration(false); setDurationValue('') }}
                          className="shrink-0 text-xs"
                        >
                          Presets
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Start date picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-secondary/50",
                          !planStartDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(planStartDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarWidget
                        mode="single"
                        selected={planStartDate}
                        onSelect={(date) => date && setPlanStartDate(date)}
                        disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleCreatePlan} className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Plan Info */}
      {activePlan && (
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{activePlan.name}</h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
                    <span>{activePlan.days.filter(d => !d.isRest).length} training</span>
                    <span>&middot; {activePlan.days.filter(d => d.isRest).length} rest</span>
                    {activePlan.durationWeeks > 0 && (
                      <span>&middot; {activePlan.durationWeeks}w</span>
                    )}
                    {activePlan.startDate && (
                      <span>&middot; {format(new Date(activePlan.startDate), 'MMM d')}</span>
                    )}
                  </div>
                  {activePlan.durationWeeks > 0 && activePlan.startDate && (() => {
                    const elapsed = (Date.now() - new Date(activePlan.startDate!).getTime()) / (7 * 24 * 60 * 60 * 1000)
                    const currentWeek = Math.min(Math.max(1, Math.ceil(elapsed)), activePlan.durationWeeks)
                    const pct = Math.min(100, Math.max(0, (elapsed / activePlan.durationWeeks) * 100))
                    return (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Week {currentWeek}/{activePlan.durationWeeks}</span>
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Pre-fill edit duration state from current plan
                    const w = activePlan.durationWeeks
                    if (w === 0) {
                      setDurationMode('ongoing')
                      setDurationValue('')
                    } else if (w % 52 === 0 && w >= 52) {
                      setDurationMode('years')
                      setDurationValue(String(w / 52))
                    } else if (w % 4 === 0 && w >= 4) {
                      setDurationMode('months')
                      setDurationValue(String(w / 4))
                    } else {
                      setDurationMode('weeks')
                      setDurationValue(String(w))
                    }
                    setIsEditingDuration(true)
                    setPlanStartDate(activePlan.startDate ? new Date(activePlan.startDate) : new Date())
                  }}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Edit duration"
                >
                  <Timer className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setRestDays(new Set(activePlan.days.filter(d => d.isRest).map(d => d.day)))
                    setIsEditingSchedule(true)
                  }}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDeletePlan(true)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Plan Confirmation */}
      <AlertDialog open={confirmDeletePlan} onOpenChange={setConfirmDeletePlan}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Training Plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{activePlan?.name}</strong>? This action cannot be undone and all exercises in this plan will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (activePlan) deleteTrainingPlan(activePlan.id)
              }}
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Rest Day Confirmation */}
      <AlertDialog open={!!confirmRestDay} onOpenChange={(open) => !open && setConfirmRestDay(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-muted-foreground" />
              Mark as Rest Day
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all exercises from <strong>{confirmRestDay}</strong> and mark it as a rest day. You can change it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (confirmRestDay) handleToggleRestDayOnPlan(confirmRestDay)
              setConfirmRestDay(null)
            }}>
              Mark Rest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditingSchedule} onOpenChange={setIsEditingSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Schedule
            </DialogTitle>
            <DialogDescription>
              Toggle which days are training vs. rest days for <strong>{activePlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(day => {
                const isRest = restDays.has(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleRestDay(day)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg py-2 px-1 text-xs font-medium transition-all border",
                      isRest
                        ? "bg-secondary/50 text-muted-foreground border-transparent"
                        : "bg-primary/10 text-primary border-primary/30"
                    )}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span className="text-[10px]">{isRest ? 'Rest' : 'Train'}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Marking a training day as rest will clear its exercises.
            </p>
            <Button onClick={handleSaveScheduleEdit} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Duration Dialog */}
      <Dialog open={isEditingDuration} onOpenChange={(open) => { setIsEditingDuration(open); if (!open) setIsCustomDuration(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Edit Duration
            </DialogTitle>
            <DialogDescription>
              Change the time frame for <strong>{activePlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Select
                value={durationMode}
                onValueChange={(val: 'ongoing' | 'weeks' | 'months' | 'years') => {
                  setDurationMode(val)
                  setDurationValue('')
                  setIsCustomDuration(false)
                }}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
              {durationMode !== 'ongoing' && !isCustomDuration && (
                <Select
                  value={durationValue || ''}
                  onValueChange={(val) => {
                    if (val === 'custom') {
                      setIsCustomDuration(true)
                      setDurationValue('')
                    } else {
                      setDurationValue(val)
                    }
                  }}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue placeholder={`Select ${durationMode}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {durationPresets[durationMode].map(v => (
                      <SelectItem key={v} value={String(v)}>
                        {v} {durationMode}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {durationMode !== 'ongoing' && isCustomDuration && (
                <div className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    placeholder={`Max ${durationMax[durationMode]}`}
                    value={durationValue}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0
                      setDurationValue(v > durationMax[durationMode] ? String(durationMax[durationMode]) : e.target.value)
                    }}
                    min={1}
                    max={durationMax[durationMode]}
                    className="bg-secondary/50 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setIsCustomDuration(false); setDurationValue('') }}
                    className="shrink-0 text-xs"
                  >
                    Presets
                  </Button>
                </div>
              )}
            </div>
            {/* Start date picker in edit dialog */}
            <div>
              <p className="text-sm font-medium mb-2">Start Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-secondary/50",
                      !planStartDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(planStartDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarWidget
                    mode="single"
                    selected={planStartDate}
                    onSelect={(date) => date && setPlanStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSaveDurationEdit} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Save Duration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Days */}
      {activePlan ? (
        <div className="space-y-3">
          {activePlan.days.map((dayPlan, dayIndex) => {
            const dayExercises = dayPlan.exercises
              .map(id => exercises.find(e => e.id === id))
              .filter(Boolean) as Exercise[]
            const isExpanded = expandedDay === dayPlan.day
            const isRestDay = dayPlan.isRest ?? false
            const DayIcon = dayConfig[dayPlan.day]?.icon || Zap
            const dayColor = dayConfig[dayPlan.day]?.color || 'text-primary'

            // Get unique muscle groups for the day
            const muscleGroups = [...new Set(dayExercises.map(e => e.muscleGroup))]
            const splitLabel = getSplitLabel(dayPlan.exercises)

            return (
              <motion.div
                key={dayPlan.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
              >
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => setExpandedDay(isExpanded ? null : dayPlan.day)}
                >
                  <Card className={cn(
                    "overflow-hidden transition-all",
                    isExpanded && "ring-2 ring-primary/20",
                    isRestDay && "opacity-70"
                  )}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center",
                                isRestDay ? "bg-secondary" : "bg-primary/10"
                              )}
                            >
                              <DayIcon className={cn(
                                "w-5 h-5",
                                isRestDay ? "text-muted-foreground" : dayColor
                              )} />
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{dayPlan.day}</h3>
                                {splitLabel && !isRestDay && (
                                  <Badge variant="outline" className={cn(
                                    "text-xs",
                                    (SPLIT_COLORS[splitLabel] || DEFAULT_SPLIT_COLOR).bg,
                                    (SPLIT_COLORS[splitLabel] || DEFAULT_SPLIT_COLOR).text,
                                    (SPLIT_COLORS[splitLabel] || DEFAULT_SPLIT_COLOR).border,
                                  )}>
                                    {splitLabel}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isRestDay ? 'Rest Day' : dayExercises.length > 0 ? `${dayExercises.length} exercises` : 'No exercises yet'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRestDay ? (
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer select-none bg-secondary/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleRestDayOnPlan(dayPlan.day)
                                }}
                              >
                                <Moon className="w-3 h-3 mr-1" />
                                Rest
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer select-none hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (dayExercises.length > 0) {
                                    setConfirmRestDay(dayPlan.day)
                                  } else {
                                    handleToggleRestDayOnPlan(dayPlan.day)
                                  }
                                }}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Mark Rest
                              </Badge>
                            )}
                            {!isRestDay && (
                              <div className="hidden sm:flex gap-1">
                                {muscleGroups.slice(0, 3).map(group => {
                                  const colorConfig = getMuscleGroupColor(group)
                                  return (
                                    <Badge 
                                      key={group} 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs capitalize",
                                        colorConfig.bg, colorConfig.text, colorConfig.border
                                      )}
                                    >
                                      {group}
                                    </Badge>
                                  )
                                })}
                                {muscleGroups.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{muscleGroups.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={(e) => handleDragEnd(e, dayPlan.day)}
                        >
                          <SortableContext
                            items={dayExercises.map(e => e.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2 mb-4">
                              <AnimatePresence>
                                {dayExercises.map((exercise) => (
                                  <SortableExerciseItem
                                    key={exercise.id}
                                    exercise={exercise}
                                    onRemove={() => handleRemoveExercise(dayPlan.day, exercise.id)}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          </SortableContext>
                          <DragOverlay>
                            {activeExercise && (
                              <DraggableExerciseOverlay exercise={activeExercise} />
                            )}
                          </DragOverlay>
                        </DndContext>

                        {/* Add Exercise / Split Selector buttons */}
                        <div className="flex gap-2">
                        <Dialog 
                          open={addExerciseDialog === dayPlan.day} 
                          onOpenChange={(open) => {
                            setAddExerciseDialog(open ? dayPlan.day : null)
                            if (!open) setExerciseSearch('')
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 gap-2 border-dashed">
                              <Plus className="w-4 h-4" />
                              Add Exercise
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[80dvh] !overflow-hidden flex flex-col">
                            <DialogHeader className="shrink-0">
                              <DialogTitle>Add Exercise to {dayPlan.day}</DialogTitle>
                              <DialogDescription>
                                Select an exercise to add to your training plan.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 shrink-0">
                              <Input
                                placeholder="Search exercises..."
                                value={exerciseSearch}
                                onChange={(e) => setExerciseSearch(e.target.value)}
                                className="bg-secondary/50"
                              />
                            </div>
                            <div className="space-y-2 pt-2 overflow-y-auto flex-1 overscroll-contain">
                              {exercises
                                .filter(e => !dayPlan.exercises.includes(e.id))
                                .filter(e => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                                .map(exercise => {
                                  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)
                                  return (
                                    <motion.button
                                      key={exercise.id}
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      onClick={() => handleAddExercise(dayPlan.day, exercise.id)}
                                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors text-left border border-transparent hover:border-border/50"
                                    >
                                      <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        colorConfig.bg
                                      )}>
                                        <ExerciseIcon 
                                          exerciseId={exercise.id}
                                          muscleGroup={exercise.muscleGroup}
                                          className={cn("w-5 h-5", colorConfig.text)}
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium">{exercise.name}</p>
                                        <p className={cn("text-xs capitalize", colorConfig.text)}>
                                          {exercise.muscleGroup}
                                        </p>
                                      </div>
                                      <Plus className="w-4 h-4 text-muted-foreground" />
                                    </motion.button>
                                  )
                                })}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Split type selector */}
                        <Select
                          value={splitLabel || ''}
                          onValueChange={(val) => handleChangeSplit(dayPlan.day, val)}
                        >
                          <SelectTrigger className="h-8 -mt-[2px] text-xs bg-secondary/30 border-dashed">
                            <SelectValue placeholder="Split type" />
                          </SelectTrigger>
                          <SelectContent>
                            {planSplitOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No training plan selected</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Create or select a plan to get started</p>
        </div>
      )}
    </div>
  )
}
