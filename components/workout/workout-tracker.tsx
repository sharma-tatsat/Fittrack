'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  Search, 
  Plus, 
  Trophy,
  TrendingUp,
  Check,
  X,
  ChevronDown,
  Flame,
  Zap,
  Star,
  Calendar,
  Dumbbell,
  Pencil,
  Trash2
} from 'lucide-react'
import { useFitnessStore, type Exercise, type PersonalRecord, type WorkoutLog } from '@/lib/store'
import { ExerciseIcon, getMuscleGroupColor } from '@/lib/exercise-icons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

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

// Extracted exercise card component
function ExerciseCard({
  exercise,
  index,
  getPR,
  getExerciseLogs,
  getChartData,
  expandedExercise,
  setExpandedExercise,
  setSelectedExercise,
  weightUnit,
}: {
  exercise: Exercise
  index: number
  getPR: (id: string) => PersonalRecord | undefined
  getExerciseLogs: (id: string) => WorkoutLog[]
  getChartData: (id: string) => { date: string; weight: number }[]
  expandedExercise: string | null
  setExpandedExercise: (id: string | null) => void
  setSelectedExercise: (e: Exercise | null) => void
  weightUnit: 'lbs' | 'kg'
}) {
  const pr = getPR(exercise.id)
  const logs = getExerciseLogs(exercise.id)
  const chartData = getChartData(exercise.id)
  const isExpanded = expandedExercise === exercise.id
  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)

  return (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Collapsible
        open={isExpanded}
        onOpenChange={() => setExpandedExercise(isExpanded ? null : exercise.id)}
      >
        <Card className={cn(
          "overflow-hidden transition-all",
          isExpanded && "ring-2 ring-primary/30"
        )}>
          <div className={cn("h-1 bg-gradient-to-r", colorConfig.gradient)} />
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorConfig.bg)}
                  >
                    <ExerciseIcon
                      exerciseId={exercise.id}
                      muscleGroup={exercise.muscleGroup}
                      className={cn("w-6 h-6", colorConfig.text)}
                    />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", colorConfig.bg, colorConfig.text, colorConfig.border)}
                      >
                        {exercise.muscleGroup}
                      </Badge>
                      {pr && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span className="text-primary font-semibold">{pr.maxWeight} {weightUnit}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedExercise(exercise)
                    }}
                    className="gap-1 shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Log
                  </Button>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              {chartData.length > 1 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className={cn("w-4 h-4", colorConfig.text)} />
                    Weight Progression
                  </div>
                  <div className="h-48 rounded-xl bg-secondary/20 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`gradient-${exercise.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: 'oklch(var(--muted-foreground))' }}
                          stroke="oklch(var(--border))"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: 'oklch(var(--muted-foreground))' }}
                          stroke="oklch(var(--border))"
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(var(--card))',
                            border: '1px solid oklch(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                          }}
                          labelStyle={{ color: 'oklch(var(--foreground))' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="oklch(var(--primary))"
                          strokeWidth={3}
                          fill={`url(#gradient-${exercise.id})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{logs.length} total sets logged</span>
                    {pr && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Trophy className="w-4 h-4" />
                        Best: {pr.maxWeight} {weightUnit}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">Log more workouts to see your progress chart</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  )
}

export function WorkoutTracker() {
  const { exercises, trainingPlans, activeTrainingPlanId, addWorkoutLog, getExerciseLogs, getPR, updatePR, deletePR, weightUnit, setWeightUnit } = useFitnessStore()
  const [search, setSearch] = useState('')
  const [showAllExercises, setShowAllExercises] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showPRCelebration, setShowPRCelebration] = useState(false)
  const [newPRWeight, setNewPRWeight] = useState(0)
  const [workoutForm, setWorkoutForm] = useState({
    weight: '',
    reps: '',
    sets: '',
  })
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)

  // PR prompt state
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [prPromptValue, setPrPromptValue] = useState('')
  const [editingPR, setEditingPR] = useState(false)
  const [editPRValue, setEditPRValue] = useState('')

  // Determine today's day name
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())

  // Get today's planned exercises from the active training plan
  const activePlan = trainingPlans.find(p => p.id === activeTrainingPlanId)

  // Check if plan has started yet
  const planStarted = !activePlan?.startDate || new Date(activePlan.startDate) <= new Date()
  const planStartDate = activePlan?.startDate ? new Date(activePlan.startDate) : null

  const todayPlan = planStarted ? activePlan?.days.find(d => d.day === todayName) : undefined
  const todayExerciseIds = new Set(todayPlan?.exercises ?? [])
  const todayExercises = (todayPlan?.exercises ?? [])
    .map(id => exercises.find(e => e.id === id))
    .filter(Boolean) as Exercise[]
  const isRestDay = activePlan != null && planStarted && (todayPlan?.isRest ?? false)

  // Derive split label from muscle groups
  const getSplitLabel = (exerciseIds: string[]): string | null => {
    if (exerciseIds.length === 0) return null
    const groups = new Set(
      exerciseIds.map(id => exercises.find(e => e.id === id)?.muscleGroup).filter(Boolean)
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
  const todaySplitLabel = getSplitLabel(todayPlan?.exercises ?? [])

  // Other exercises (not in today's plan) — shown when searching or toggled
  const otherExercises = exercises.filter(e => !todayExerciseIds.has(e.id))
  const filteredOtherExercises = otherExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  )

  // When no active plan, just show all exercises filtered by search
  const noActivePlan = !activePlan
  const filteredExercises = noActivePlan
    ? exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const triggerConfetti = useCallback(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#ffd700'],
    })
    fire(0.2, {
      spread: 60,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#ffd700'],
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#ffd700'],
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#ffd700'],
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#ff6b35', '#f7c59f', '#2ec4b6', '#ffd700'],
    })
  }, [])

  const handleLogWorkout = () => {
    if (!selectedExercise || !workoutForm.weight || !workoutForm.reps || !workoutForm.sets) return

    const weight = parseFloat(workoutForm.weight)
    const currentPR = getPR(selectedExercise.id)

    // If user entered a manual PR via the prompt (no existing PR), save it first
    if (!currentPR && prPromptValue && !isFirstTime) {
      updatePR(selectedExercise.id, parseFloat(prPromptValue))
    }

    // If first time, force-set whatever they log as the PR
    if (isFirstTime && !currentPR) {
      updatePR(selectedExercise.id, weight)
    }

    const { isNewPR } = addWorkoutLog({
      exerciseId: selectedExercise.id,
      weight,
      reps: parseInt(workoutForm.reps),
      sets: parseInt(workoutForm.sets),
      date: new Date().toISOString(),
    })

    // Show celebration if it's a new PR (and not first time — first time always sets PR)
    if (isNewPR && !isFirstTime) {
      setNewPRWeight(weight)
      setShowPRCelebration(true)
      triggerConfetti()
      setTimeout(() => setShowPRCelebration(false), 4000)
    }

    setWorkoutForm({ weight: '', reps: '', sets: '' })
    setSelectedExercise(null)
    setIsFirstTime(false)
    setPrPromptValue('')
    setEditingPR(false)
    setEditPRValue('')
  }

  const handleSaveEditPR = () => {
    if (!selectedExercise || !editPRValue) return
    updatePR(selectedExercise.id, parseFloat(editPRValue))
    setEditingPR(false)
    setEditPRValue('')
  }

  const handleDeletePR = () => {
    if (!selectedExercise) return
    deletePR(selectedExercise.id)
  }

  const getChartData = (exerciseId: string) => {
    const logs = getExerciseLogs(exerciseId)
    return logs.slice(-10).map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      weight: log.weight,
    }))
  }

  return (
    <div className="space-y-6">
      {/* PR Celebration Modal */}
      <AnimatePresence>
        {showPRCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-gradient-to-br from-card to-card/80 border-2 border-primary/50 rounded-3xl p-8 text-center max-w-md shadow-2xl shadow-primary/30"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-amber-500/30 flex items-center justify-center border-2 border-primary/30"
              >
                <Trophy className="w-12 h-12 text-primary" />
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Flame className="w-8 h-8 text-primary" />
                  NEW PR!
                  <Flame className="w-8 h-8 text-primary" />
                </span>
              </motion.h2>
              <motion.p 
                className="text-5xl font-bold text-primary my-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {newPRWeight} {weightUnit}
              </motion.p>
              <p className="text-muted-foreground text-lg">
                {"You're stronger than yesterday!"}
              </p>
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Workout Tracker
            <Zap className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground">
            {activePlan
              ? isRestDay
                ? `Rest day — ${activePlan.name}`
                : `${todayName}${todaySplitLabel ? ` · ${todaySplitLabel}` : ''} — ${activePlan.name}`
              : 'Log your exercises and crush your PRs'}
          </p>
        </div>
      </div>

      {/* Plan Not Started Banner */}
      {activePlan && !planStarted && planStartDate && (
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Plan Starts {format(planStartDate, 'EEEE, MMM d')}</h3>
            <p className="text-sm text-muted-foreground">
              Your plan <strong>{activePlan.name}</strong> hasn{"'"}t begun yet. You can still log workouts below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's Planned Exercises */}
      {activePlan && !isRestDay && todayExercises.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {"Today's Plan"}
            </h2>
            {todaySplitLabel && (() => {
              const sc = SPLIT_COLORS[todaySplitLabel] || DEFAULT_SPLIT_COLOR
              return (
                <Badge variant="outline" className={cn("text-xs", sc.bg, sc.text, sc.border)}>
                  {todaySplitLabel}
                </Badge>
              )
            })()}
            <Badge variant="outline" className="text-xs ml-auto">
              {todayExercises.length} exercises
            </Badge>
          </div>
          {todayExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              getPR={getPR}
              getExerciseLogs={getExerciseLogs}
              getChartData={getChartData}
              expandedExercise={expandedExercise}
              setExpandedExercise={setExpandedExercise}
              setSelectedExercise={setSelectedExercise}
              weightUnit={weightUnit}
            />
          ))}
        </div>
      )}

      {/* Rest Day Banner */}
      {activePlan && isRestDay && (
        <Card className="bg-gradient-to-r from-secondary/50 to-transparent border-border/50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-secondary flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Rest Day</h3>
            <p className="text-sm text-muted-foreground">
              No exercises planned for {todayName}. You can still log a workout below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Other Exercises / Search */}
      {activePlan ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowAllExercises(!showAllExercises)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <Dumbbell className="w-4 h-4" />
            <span>All Exercises</span>
            <motion.div animate={{ rotate: showAllExercises ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            <Badge variant="outline" className="text-xs ml-auto">{otherExercises.length}</Badge>
          </button>

          <AnimatePresence>
            {showAllExercises && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-card border-border/50 focus:border-primary/50 transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {filteredOtherExercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    getPR={getPR}
                    getExerciseLogs={getExerciseLogs}
                    getChartData={getChartData}
                    expandedExercise={expandedExercise}
                    setExpandedExercise={setExpandedExercise}
                    setSelectedExercise={setSelectedExercise}
                    weightUnit={weightUnit}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {/* No active plan — show flat search list like before */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises to log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredExercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                getPR={getPR}
                getExerciseLogs={getExerciseLogs}
                getChartData={getChartData}
                expandedExercise={expandedExercise}
                setExpandedExercise={setExpandedExercise}
                setSelectedExercise={setSelectedExercise}
                weightUnit={weightUnit}
              />
            ))}
          </div>
        </>
      )}

      {/* Log Workout Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={(open) => {
        if (!open) {
          setSelectedExercise(null)
          setIsFirstTime(false)
          setPrPromptValue('')
          setEditingPR(false)
          setEditPRValue('')
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedExercise && (
                <>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    getMuscleGroupColor(selectedExercise.muscleGroup).bg
                  )}>
                    <ExerciseIcon 
                      exerciseId={selectedExercise.id}
                      muscleGroup={selectedExercise.muscleGroup}
                      className={cn("w-5 h-5", getMuscleGroupColor(selectedExercise.muscleGroup).text)}
                    />
                  </div>
                  Log {selectedExercise.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Record your sets, reps, and weight for this exercise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Existing PR — editable/deletable */}
            {selectedExercise && getPR(selectedExercise.id) && !editingPR && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current PR</p>
                      <p className="text-2xl font-bold text-amber-500">{getPR(selectedExercise.id)?.maxWeight} {weightUnit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingPR(true)
                        setEditPRValue(String(getPR(selectedExercise.id)?.maxWeight ?? ''))
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={handleDeletePR}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Edit PR inline */}
            {selectedExercise && editingPR && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
              >
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-amber-500" />
                  Edit PR
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="New PR weight"
                    value={editPRValue}
                    onChange={(e) => setEditPRValue(e.target.value)}
                    className="text-center font-semibold bg-secondary/50"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEditPR} disabled={!editPRValue}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingPR(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* No PR — prompt to set one or mark first time */}
            {selectedExercise && !getPR(selectedExercise.id) && !editingPR && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    {"What's your PR for this exercise?"}
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Switch
                    checked={isFirstTime}
                    onCheckedChange={(checked) => {
                      setIsFirstTime(checked)
                      if (checked) setPrPromptValue('')
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    First time doing this exercise
                  </span>
                </div>
                {!isFirstTime && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      type="number"
                      placeholder={`Enter your PR in ${weightUnit}`}
                      value={prPromptValue}
                      onChange={(e) => setPrPromptValue(e.target.value)}
                      className="text-center font-semibold bg-secondary/50"
                    />
                  </motion.div>
                )}
                {isFirstTime && (
                  <p className="text-xs text-muted-foreground italic">
                    Your logged weight will automatically become your PR.
                  </p>
                )}
              </motion.div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Weight
                  <button
                    type="button"
                    onClick={() => setWeightUnit(weightUnit === 'lbs' ? 'kg' : 'lbs')}
                    className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {weightUnit}
                  </button>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={workoutForm.weight}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="text-center text-lg font-semibold bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Reps</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={workoutForm.reps}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, reps: e.target.value }))}
                  className="text-center text-lg font-semibold bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Sets</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={workoutForm.sets}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, sets: e.target.value }))}
                  className="text-center text-lg font-semibold bg-secondary/50"
                />
              </div>
            </div>
            <Button 
              onClick={handleLogWorkout} 
              className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/20"
              disabled={!workoutForm.weight || !workoutForm.reps || !workoutForm.sets}
            >
              <Check className="w-5 h-5" />
              Log Workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
