'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Flame,
  Calendar as CalendarIcon,
  Dumbbell,
  Sparkles,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react'
import { useFitnessStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday as checkIsToday,
  addWeeks,
  isBefore,
  isAfter,
  startOfDay
} from 'date-fns'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarView() {
  const { checkIns, toggleCheckIn, getStreak, workoutLogs, trainingPlans, activeTrainingPlanId } = useFitnessStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const streak = getStreak()
  const today = new Date()
  const todayString = format(today, 'yyyy-MM-dd')
  const todayCheckIn = checkIns.find(c => c.date === todayString)
  const didGoToGymToday = todayCheckIn?.completed || false

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getCheckInForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return checkIns.find(c => c.date === dateString)
  }

  const getWorkoutsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return workoutLogs.filter(log => log.date.startsWith(dateString))
  }

  // Active training plan helpers
  const activePlan = trainingPlans.find(p => p.id === activeTrainingPlanId) ?? null

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const isPlannedGymDay = (date: Date): boolean => {
    if (!activePlan) return false
    const dayName = DAY_NAMES[date.getDay()]
    const planDay = activePlan.days.find(d => d.day === dayName)
    if (!planDay || planDay.isRest) return false
    // If the plan has a duration + start date, check bounds
    if (activePlan.durationWeeks && activePlan.startDate) {
      const planStart = startOfDay(new Date(activePlan.startDate))
      const planEnd = addWeeks(planStart, activePlan.durationWeeks)
      if (isBefore(date, planStart) || isAfter(date, planEnd)) return false
    }
    return true
  }

  const isPlannedRestDay = (date: Date): boolean => {
    if (!activePlan) return false
    const dayName = DAY_NAMES[date.getDay()]
    const planDay = activePlan.days.find(d => d.day === dayName)
    if (!planDay) return false
    return planDay.isRest === true
  }

  // Monthly stats
  const currentMonthCheckIns = checkIns.filter(c => {
    const checkDate = new Date(c.date)
    return isSameMonth(checkDate, currentMonth) && c.completed
  }).length

  const totalDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length
  const consistency = Math.round((currentMonthCheckIns / totalDaysInMonth) * 100)

  // Get motivational message based on consistency
  const getMotivation = () => {
    if (consistency >= 80) return { text: "Incredible dedication!", icon: Sparkles }
    if (consistency >= 60) return { text: "Great progress!", icon: TrendingUp }
    if (consistency >= 40) return { text: "Keep pushing!", icon: Zap }
    return { text: "Every day counts!", icon: Target }
  }
  const motivation = getMotivation()
  const MotivationIcon = motivation.icon

  // Satisfying click sound using Web Audio API
  const playClickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.12)
    } catch { /* audio not available */ }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Calendar
          <CalendarIcon className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-muted-foreground">Track your gym visits and maintain your streak</p>
      </div>

      {/* Today's Check-in Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-500",
          didGoToGymToday 
            ? "bg-gradient-to-r from-success/20 to-success/5 border-success/30" 
            : "bg-gradient-to-r from-primary/10 to-transparent border-primary/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={didGoToGymToday ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 0.5, repeat: didGoToGymToday ? Infinity : 0, repeatDelay: 2 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                    didGoToGymToday 
                      ? "bg-success/30 shadow-lg shadow-success/20" 
                      : "bg-primary/20"
                  )}
                >
                  {didGoToGymToday ? (
                    <Check className="w-8 h-8 text-success" />
                  ) : (
                    <Dumbbell className="w-8 h-8 text-primary" />
                  )}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">
                    {didGoToGymToday ? "You crushed it today!" : "Did you hit the gym today?"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(today, 'EEEE, MMMM d, yyyy')}
                  </p>
                  {didGoToGymToday && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-success mt-1 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Another day closer to your goals
                    </motion.p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Switch
                  checked={didGoToGymToday}
                  onCheckedChange={() => toggleCheckIn(todayString)}
                  className="scale-125"
                />
                <span className="text-xs text-muted-foreground">
                  {didGoToGymToday ? 'Logged' : 'Not logged'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Day Streak', 
            value: streak, 
            icon: Flame, 
            color: 'primary',
            gradient: 'from-primary/20 to-primary/5',
            textColor: 'text-primary'
          },
          { 
            label: 'This Month', 
            value: currentMonthCheckIns, 
            icon: CalendarIcon, 
            color: 'emerald-500',
            gradient: 'from-emerald-500/20 to-emerald-500/5',
            textColor: 'text-emerald-500'
          },
          { 
            label: 'Consistency', 
            value: `${consistency}%`, 
            icon: TrendingUp, 
            color: 'violet-500',
            gradient: 'from-violet-500/20 to-violet-500/5',
            textColor: 'text-violet-500'
          },
          { 
            label: 'Total Sessions', 
            value: checkIns.filter(c => c.completed).length, 
            icon: Target, 
            color: 'amber-500',
            gradient: 'from-amber-500/20 to-amber-500/5',
            textColor: 'text-amber-500'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Card className={cn(
              "bg-gradient-to-br overflow-hidden",
              stat.gradient
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center",
                      `bg-${stat.color}/20`
                    )}
                  >
                    <stat.icon className={cn("w-5 h-5", stat.textColor)} />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Plan Progress */}
      {activePlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{activePlan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activePlan.days.filter(d => !d.isRest).length} gym days/week
                      {activePlan.durationWeeks > 0 && activePlan.startDate && (() => {
                        const currentWeek = Math.min(
                          Math.max(1, Math.ceil((Date.now() - new Date(activePlan.startDate!).getTime()) / (7 * 24 * 60 * 60 * 1000))),
                          activePlan.durationWeeks
                        )
                        return ` · Week ${currentWeek} of ${activePlan.durationWeeks}`
                      })()}
                      {!activePlan.durationWeeks && ' · Ongoing'}
                    </p>
                  </div>
                </div>
                {activePlan.durationWeeks > 0 && activePlan.startDate && (
                  <div className="w-32">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, Math.max(0, ((Date.now() - new Date(activePlan.startDate!).getTime()) / (activePlan.durationWeeks * 7 * 24 * 60 * 60 * 1000)) * 100))}%`
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Calendar */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MotivationIcon className="w-4 h-4 text-primary" />
              <span className="text-xs">{motivation.text}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs px-3"
            >
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="hover:bg-secondary">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-3">
            {WEEKDAYS.map((day, i) => (
              <div 
                key={day} 
                className={cn(
                  "text-center text-xs font-semibold py-2 rounded-lg",
                  i === 0 || i === 6 ? "text-muted-foreground/70" : "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
                const checkIn = getCheckInForDate(day)
                const workouts = getWorkoutsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isToday = checkIsToday(day)
                const hasWorkout = checkIn?.completed || false
                const hasLoggedExercises = workouts.length > 0
                const isPlanned = isPlannedGymDay(day)
                const isRest = isPlannedRestDay(day)

                return (
                  <div key={day.toISOString()} className="flex items-center justify-center py-1">
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.003 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        playClickSound()
                        toggleCheckIn(format(day, 'yyyy-MM-dd'))
                      }}
                      className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        !isCurrentMonth && "opacity-25",
                        isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                        hasWorkout 
                          ? "bg-success/25 shadow-sm shadow-success/20" 
                          : isPlanned
                            ? "bg-primary/15 border-2 border-primary/40"
                            : "hover:bg-secondary/50"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium leading-none",
                        isToday && "text-primary font-bold",
                        hasWorkout && "text-success",
                        !hasWorkout && isPlanned && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {hasWorkout && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className="absolute -bottom-0.5"
                        >
                          <Check className="w-3 h-3 text-success" />
                        </motion.div>
                      )}
                      {isPlanned && !hasWorkout && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-0.5"
                        >
                          <Dumbbell className="w-2.5 h-2.5 text-primary/60" />
                        </motion.div>
                      )}
                      {hasLoggedExercises && !hasWorkout && !isPlanned && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" 
                        />
                      )}
                    </motion.button>
                  </div>
                )
              })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-success/25 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-success" />
              </div>
              <span className="text-muted-foreground">Logged</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center">
                <Dumbbell className="w-3 h-3 text-primary/60" />
              </div>
              <span className="text-muted-foreground">Planned</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-muted-foreground">Workout</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full ring-2 ring-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{format(today, 'd')}</span>
              </div>
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
