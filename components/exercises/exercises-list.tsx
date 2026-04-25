'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Dumbbell,
  Filter,
  X,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useFitnessStore, type MuscleGroup, type Exercise } from '@/lib/store'
import { ExerciseIcon, getMuscleGroupColor } from '@/lib/exercise-icons'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const muscleGroups: { value: MuscleGroup | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '💪' },
  { value: 'chest', label: 'Chest', emoji: '🫁' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'legs', label: 'Legs', emoji: '🦵' },
  { value: 'shoulders', label: 'Shoulders', emoji: '🏋️' },
  { value: 'arms', label: 'Arms', emoji: '💪' },
  { value: 'core', label: 'Core', emoji: '🎯' },
]

const difficultyConfig = {
  beginner: { 
    label: 'Beginner',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: '🌱'
  },
  intermediate: { 
    label: 'Intermediate',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: '🔥'
  },
  advanced: { 
    label: 'Advanced',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    icon: '⚡'
  },
}

export function ExercisesList() {
  const { exercises, addExercise, getPR } = useFitnessStore()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'chest' as MuscleGroup,
    difficulty: 'beginner' as Exercise['difficulty'],
  })

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = selectedGroup === 'all' || exercise.muscleGroup === selectedGroup
    return matchesSearch && matchesGroup
  })

  // Group exercises by muscle group for the "all" view
  const groupedExercises = selectedGroup === 'all' 
    ? Object.entries(
        filteredExercises.reduce((acc, ex) => {
          if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
          acc[ex.muscleGroup].push(ex)
          return acc
        }, {} as Record<MuscleGroup, Exercise[]>)
      )
    : [['filtered', filteredExercises] as const]

  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      addExercise({
        name: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
        difficulty: newExercise.difficulty,
        icon: 'Dumbbell',
      })
      setNewExercise({ name: '', muscleGroup: 'chest', difficulty: 'beginner' })
      setIsDialogOpen(false)
    }
  }

  const totalPRs = exercises.filter(ex => getPR(ex.id)).length

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Exercise Library
            <Zap className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {exercises.length} exercises 
            <span className="inline-flex items-center gap-1 text-primary">
              <TrendingUp className="w-3 h-3" />
              {totalPRs} with PRs
            </span>
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Plus className="w-4 h-4" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Add Custom Exercise
              </DialogTitle>
              <DialogDescription>
                Create a new exercise to add to your library.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exercise Name</label>
                <Input
                  placeholder="e.g., Romanian Deadlift"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Muscle Group</label>
                <Select
                  value={newExercise.muscleGroup}
                  onValueChange={(v) => setNewExercise(prev => ({ ...prev, muscleGroup: v as MuscleGroup }))}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.filter(m => m.value !== 'all').map(group => (
                      <SelectItem key={group.value} value={group.value}>
                        <span className="flex items-center gap-2">
                          <span>{group.emoji}</span>
                          {group.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={newExercise.difficulty}
                  onValueChange={(v) => setNewExercise(prev => ({ ...prev, difficulty: v as Exercise['difficulty'] }))}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficultyConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddExercise} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                Add Exercise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {muscleGroups.map(group => {
            const isSelected = selectedGroup === group.value
            const colorConfig = group.value !== 'all' ? getMuscleGroupColor(group.value as MuscleGroup) : null
            return (
              <motion.button
                key={group.value}
                onClick={() => setSelectedGroup(group.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : colorConfig 
                      ? `${colorConfig.bg} ${colorConfig.text} ${colorConfig.border} hover:opacity-80`
                      : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                )}
              >
                {group.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Exercises Grid - Grouped when "All" is selected */}
      <div className="space-y-8">
        {groupedExercises.map(([group, groupExercises]) => {
          const colorConfig = group !== 'filtered' ? getMuscleGroupColor(group as MuscleGroup) : null
          const groupInfo = muscleGroups.find(m => m.value === group)
          
          return (
            <div key={group}>
              {selectedGroup === 'all' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    colorConfig?.bg
                  )}>
                    <span className="text-lg">{groupInfo?.emoji}</span>
                  </div>
                  <h2 className={cn("text-lg font-semibold capitalize", colorConfig?.text)}>
                    {group}
                  </h2>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-sm text-muted-foreground">{groupExercises.length}</span>
                </div>
              )}
              
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {groupExercises.map((exercise, index) => {
                    const pr = getPR(exercise.id)
                    const colorConfig = getMuscleGroupColor(exercise.muscleGroup)
                    const diffConfig = difficultyConfig[exercise.difficulty]
                    
                    return (
                      <motion.div
                        key={exercise.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <Card className={cn(
                          "group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative",
                          `hover:shadow-${exercise.muscleGroup === 'chest' ? 'rose' : exercise.muscleGroup === 'back' ? 'blue' : exercise.muscleGroup === 'legs' ? 'emerald' : exercise.muscleGroup === 'shoulders' ? 'amber' : exercise.muscleGroup === 'arms' ? 'violet' : 'orange'}-500/10`
                        )}>
                          {/* Gradient accent line */}
                          <div className={cn(
                            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                            colorConfig.gradient
                          )} />
                          
                          <CardContent className="p-4 pt-5">
                            <div className="flex items-start gap-3">
                              <motion.div 
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                  colorConfig.bg,
                                  "group-hover:scale-105"
                                )}
                              >
                                <ExerciseIcon 
                                  exerciseId={exercise.id} 
                                  muscleGroup={exercise.muscleGroup}
                                  className={cn("w-6 h-6", colorConfig.text)}
                                />
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                    {exercise.name}
                                  </h3>
                                  {exercise.isCustom && (
                                    <Sparkles className="w-3 h-3 text-primary shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs border", colorConfig.bg, colorConfig.text, colorConfig.border)}
                                  >
                                    {exercise.muscleGroup}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs border", diffConfig.color)}
                                  >
                                    <span className="mr-1">{diffConfig.icon}</span>
                                    {exercise.difficulty}
                                  </Badge>
                                </div>
                                {pr && (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-1 mt-3 text-xs"
                                  >
                                    <TrendingUp className="w-3 h-3 text-primary" />
                                    <span className="text-muted-foreground">PR:</span>
                                    <span className="text-primary font-bold">{pr.maxWeight} {pr.unit}</span>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )
        })}
      </div>

      {filteredExercises.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">No exercises found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different search or filter</p>
        </motion.div>
      )}
    </div>
  )
}
