'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User,
  Mail,
  Trophy,
  Flame,
  Calendar,
  Dumbbell,
  TrendingUp,
  Save,
  LogOut,
  RotateCcw,
  AlertTriangle
} from 'lucide-react'
import { useFitnessStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

export function ProfileSettings() {
  const { 
    user, 
    setUser, 
    getStreak, 
    personalRecords, 
    workoutLogs, 
    checkIns,
    exercises,
    resetStatistics
  } = useFitnessStore()
  
  const [editedUser, setEditedUser] = useState(user)
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  
  const streak = getStreak()
  const totalWorkouts = checkIns.filter(c => c.completed).length
  const totalSets = workoutLogs.length
  const totalPRs = personalRecords.length

  // Find favorite muscle group
  const muscleGroupCounts: Record<string, number> = {}
  workoutLogs.forEach(log => {
    const exercise = exercises.find(e => e.id === log.exerciseId)
    if (exercise) {
      muscleGroupCounts[exercise.muscleGroup] = (muscleGroupCounts[exercise.muscleGroup] || 0) + 1
    }
  })
  const favoriteMuscleGroup = Object.entries(muscleGroupCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet'

  // Find best PR
  const bestPR = personalRecords.reduce((best, pr) => {
    if (!best || pr.maxWeight > best.maxWeight) return pr
    return best
  }, null as typeof personalRecords[0] | null)

  const bestPRExercise = bestPR ? exercises.find(e => e.id === bestPR.exerciseId) : null

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedUser.name }),
      })
      if (res.ok) {
        setUser(editedUser)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setUser(editedUser)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your stats</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Name
                </label>
                <Input
                  value={editedUser.name}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-secondary/50"
                />
              </div>

              <Button 
                onClick={handleSave}
                className={cn(
                  "w-full gap-2 transition-all",
                  saved && "bg-success text-success-foreground"
                )}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Total Workouts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSets}</p>
                  <p className="text-xs text-muted-foreground">Sets Logged</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPRs}</p>
                  <p className="text-xs text-muted-foreground">Personal Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Favorite Muscle Group</p>
                  <p className="text-sm text-muted-foreground capitalize">{favoriteMuscleGroup}</p>
                </div>
              </div>
            </div>

            {bestPRExercise && bestPR && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-chart-4/10 border border-chart-4/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-4/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="font-medium">Best PR</p>
                    <p className="text-sm text-muted-foreground">
                      {bestPRExercise.name} - {bestPR.maxWeight} lbs
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(bestPR.date), 'MMM d')}
                </p>
              </div>
            )}

            {workoutLogs.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workoutLogs[0].date), 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reset Statistics */}
      <motion.div variants={item}>
        <Card className="border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-destructive" />
                  Reset Statistics
                </h3>
                <p className="text-sm text-muted-foreground">Clear all workout logs, personal records, and check-ins</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reset Confirmation */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reset All Statistics
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your workout logs ({totalSets} sets), personal records ({totalPRs} PRs), and check-ins ({totalWorkouts} workouts). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => resetStatistics()}
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sign Out */}
      <motion.div variants={item}>
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your FitTrack account</p>
              </div>
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={() => {
                  // Clear persisted store data to prevent stale data on next login
                  localStorage.removeItem('fitness-store')
                  signOut({ callbackUrl: '/login' })
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
