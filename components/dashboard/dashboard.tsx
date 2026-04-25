'use client'

import { motion } from 'framer-motion'
import { 
  Flame, 
  Trophy, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react'
import { useFitnessStore } from '@/lib/store'
import { ExerciseIcon, getMuscleGroupColor } from '@/lib/exercise-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const motivationalMessages = [
  { text: "Every rep counts. Keep pushing!", icon: Zap },
  { text: "Stronger than yesterday.", icon: TrendingUp },
  { text: "Your only limit is you.", icon: Target },
  { text: "Discipline beats motivation.", icon: Flame },
  { text: "Champions are made in the gym.", icon: Trophy },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Dashboard() {
  const { 
    user, 
    getStreak, 
    personalRecords, 
    exercises, 
    workoutLogs,
    trainingPlans,
    activeTrainingPlanId,
    checkIns,
    weightUnit,
    setActiveTab 
  } = useFitnessStore()
  
  const streak = getStreak()
  const today = new Date()
  const dayName = format(today, 'EEEE')
  
  const activePlan = trainingPlans.find(p => p.id === activeTrainingPlanId)
  const todayWorkout = activePlan?.days.find(d => d.day === dayName)
  const todayExercises = todayWorkout?.exercises.map(id => exercises.find(e => e.id === id)).filter(Boolean) || []
  
  // Stats
  const thisWeekLogs = workoutLogs.filter(log => {
    const logDate = new Date(log.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return logDate >= weekAgo
  })
  
  const thisWeekCheckIns = checkIns.filter(c => {
    const checkDate = new Date(c.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return checkDate >= weekAgo && c.completed
  }).length
  
  const recentPRs = personalRecords.slice(-3).reverse()
  
  // Use a deterministic index for SSR, then randomize on client
  const [messageIndex, setMessageIndex] = useState(0)
  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * motivationalMessages.length))
  }, [])
  const randomMessage = motivationalMessages[messageIndex]
  const MessageIcon = randomMessage.icon

  // Get unique muscle groups for today
  const todayMuscleGroups = [...new Set(todayExercises.map(e => e?.muscleGroup).filter(Boolean))]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">
            Welcome back, {user.name}
          </h1>
          {streak >= 7 && (
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="w-7 h-7 text-primary" />
            </motion.div>
          )}
        </div>
        <motion.p 
          className="text-muted-foreground flex items-center gap-2 text-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MessageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          <span className="text-sm sm:text-base">{randomMessage.text}</span>
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Day Streak', 
            value: streak, 
            icon: Flame, 
            color: 'primary',
            gradient: 'from-primary/20 to-primary/5',
            borderColor: 'border-primary/30'
          },
          { 
            label: 'Total PRs', 
            value: personalRecords.length, 
            icon: Trophy, 
            color: 'amber-500',
            gradient: 'from-amber-500/20 to-amber-500/5',
            borderColor: 'border-amber-500/30'
          },
          { 
            label: 'Sets This Week', 
            value: thisWeekLogs.length, 
            icon: TrendingUp, 
            color: 'emerald-500',
            gradient: 'from-emerald-500/20 to-emerald-500/5',
            borderColor: 'border-emerald-500/30'
          },
          { 
            label: 'Weekly Sessions', 
            value: `${thisWeekCheckIns}/7`, 
            icon: Calendar, 
            color: 'violet-500',
            gradient: 'from-violet-500/20 to-violet-500/5',
            borderColor: 'border-violet-500/30'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Card className={cn(
              "bg-gradient-to-br overflow-hidden relative group",
              stat.gradient,
              stat.borderColor
            )}>
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-4 relative">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      `bg-${stat.color}/20`
                    )}
                  >
                    <stat.icon className={cn("w-6 h-6", `text-${stat.color}`)} />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-3xl font-bold"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Workout */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 py-4 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  {"Today's Workout"}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">{dayName}</p>
              </div>
            </div>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setActiveTab('tracker')}
              className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              Start Workout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {todayExercises.length > 0 ? (
              <div className="space-y-3">
                {/* Muscle group tags */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {todayMuscleGroups.map(group => {
                    if (!group) return null
                    const colorConfig = getMuscleGroupColor(group)
                    return (
                      <span 
                        key={group}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium capitalize",
                          colorConfig.bg, colorConfig.text
                        )}
                      >
                        {group}
                      </span>
                    )
                  })}
                </div>
                
                {todayExercises.map((exercise, index) => {
                  if (!exercise) return null
                  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)
                  return (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer group",
                        "bg-secondary/30 hover:bg-secondary/60",
                        "border border-transparent hover:border-border/50"
                      )}
                      onClick={() => setActiveTab('tracker')}
                    >
                      <div className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        colorConfig.bg
                      )}>
                        <ExerciseIcon 
                          exerciseId={exercise.id}
                          muscleGroup={exercise.muscleGroup}
                          className={cn("w-4 h-4 sm:w-5 sm:h-5", colorConfig.text)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors truncate">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{exercise.muscleGroup}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-muted-foreground">Rest day!</p>
                <p className="text-sm text-muted-foreground/70">Recover and come back stronger.</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <motion.div variants={item}>
          <Card className="overflow-hidden">
            <CardHeader className="flex items-center justify-between gap-2 py-4 bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold">
                  Recent Personal Records
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {recentPRs.map((pr, index) => {
                  const exercise = exercises.find(e => e.id === pr.exerciseId)
                  if (!exercise) return null
                  const colorConfig = getMuscleGroupColor(exercise.muscleGroup)
                  
                  return (
                    <motion.div
                      key={pr.exerciseId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
                          colorConfig.bg
                        )}>
                          <ExerciseIcon 
                            exerciseId={exercise.id}
                            muscleGroup={exercise.muscleGroup}
                            className={cn("w-5 h-5 sm:w-6 sm:h-6", colorConfig.text)}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(pr.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p
                          className="text-xl sm:text-2xl font-bold text-amber-500"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                          {weightUnit === 'kg' ? Math.round(pr.maxWeight / 2.20462) : pr.maxWeight}
                        </motion.p>
                        <p className="text-xs text-muted-foreground">{weightUnit}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
