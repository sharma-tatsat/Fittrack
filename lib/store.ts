import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  isCustom: boolean
}

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'

export interface WorkoutLog {
  id: string
  exerciseId: string
  weight: number
  reps: number
  sets: number
  date: string
}

export interface PersonalRecord {
  exerciseId: string
  maxWeight: number
  date: string
}

export interface TrainingDay {
  day: string
  exercises: string[] // exercise IDs
  isRest?: boolean
}

export interface TrainingPlan {
  id: string
  name: string
  durationWeeks: number
  startDate: string | null
  days: TrainingDay[]
}

export interface CheckIn {
  date: string
  completed: boolean
}

export interface User {
  name: string
  email: string
}

interface FitnessStore {
  // Loading state
  isLoaded: boolean

  // User
  user: User
  setUser: (user: User) => void
  
  // Exercises
  exercises: Exercise[]
  addExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void
  
  // Workout Logs
  workoutLogs: WorkoutLog[]
  addWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => { isNewPR: boolean; log: WorkoutLog }
  getExerciseLogs: (exerciseId: string) => WorkoutLog[]
  
  // Personal Records
  personalRecords: PersonalRecord[]
  getPR: (exerciseId: string) => PersonalRecord | undefined
  updatePR: (exerciseId: string, maxWeight: number) => void
  deletePR: (exerciseId: string) => void
  
  // Training Plans
  trainingPlans: TrainingPlan[]
  activeTrainingPlanId: string | null
  addTrainingPlan: (plan: Omit<TrainingPlan, 'id'>) => void
  updateTrainingPlan: (id: string, plan: Partial<TrainingPlan>) => void
  deleteTrainingPlan: (id: string) => void
  setActiveTrainingPlan: (id: string | null) => void
  
  // Check-ins
  checkIns: CheckIn[]
  toggleCheckIn: (date: string) => void
  getStreak: () => number
  
  // Navigation
  activeTab: string
  setActiveTab: (tab: string) => void

  // Preferences
  weightUnit: 'lbs' | 'kg'
  setWeightUnit: (unit: 'lbs' | 'kg') => void

  // Server sync
  loadFromServer: () => Promise<void>
}

// Helper: fire-and-forget API call (don't block UI)
function apiPost(url: string, body: unknown) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

function apiPatch(url: string, body: unknown) {
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

function apiDelete(url: string) {
  fetch(url, { method: 'DELETE' }).catch(() => {})
}

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get) => ({
      // Loading
      isLoaded: false,

      // User
      user: { name: 'Athlete', email: 'athlete@example.com' },
      setUser: (user) => {
        set({ user })
        apiPatch('/api/user', { name: user.name })
      },
      
      // Exercises
      exercises: [],
      addExercise: (exercise) => {
        const tempId = `custom-${Date.now()}`
        const newExercise: Exercise = {
          ...exercise,
          id: tempId,
          isCustom: true,
        }
        set((state) => ({ exercises: [...state.exercises, newExercise] }))

        // Sync to server and update with real ID
        fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exercise),
        })
          .then((r) => r.json())
          .then((saved) => {
            set((state) => ({
              exercises: state.exercises.map((e) =>
                e.id === tempId ? { ...e, id: saved.id } : e
              ),
            }))
          })
          .catch(() => {})
      },
      
      // Workout Logs
      workoutLogs: [],
      addWorkoutLog: (log) => {
        const newLog: WorkoutLog = {
          ...log,
          id: `log-${Date.now()}`,
        }
        
        const currentPR = get().personalRecords.find(pr => pr.exerciseId === log.exerciseId)
        const isNewPR = !currentPR || log.weight > currentPR.maxWeight
        
        if (isNewPR) {
          set((state) => ({
            personalRecords: [
              ...state.personalRecords.filter(pr => pr.exerciseId !== log.exerciseId),
              { exerciseId: log.exerciseId, maxWeight: log.weight, date: log.date }
            ]
          }))
        }
        
        set((state) => ({ workoutLogs: [...state.workoutLogs, newLog] }))

        // Sync to server
        apiPost('/api/workouts', {
          exerciseId: log.exerciseId,
          weight: log.weight,
          reps: log.reps,
          sets: log.sets,
          date: log.date,
        })

        return { isNewPR, log: newLog }
      },
      getExerciseLogs: (exerciseId) => {
        return get().workoutLogs
          .filter(log => log.exerciseId === exerciseId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      },
      
      // Personal Records
      personalRecords: [],
      getPR: (exerciseId) => get().personalRecords.find(pr => pr.exerciseId === exerciseId),
      updatePR: (exerciseId, maxWeight) => {
        const date = new Date().toISOString()
        const existing = get().personalRecords.find(pr => pr.exerciseId === exerciseId)
        if (existing) {
          set((state) => ({
            personalRecords: state.personalRecords.map(pr =>
              pr.exerciseId === exerciseId ? { ...pr, maxWeight, date } : pr
            ),
          }))
        } else {
          set((state) => ({
            personalRecords: [...state.personalRecords, { exerciseId, maxWeight, date }],
          }))
        }
        apiPatch('/api/personal-records', { exerciseId, maxWeight })
      },
      deletePR: (exerciseId) => {
        set((state) => ({
          personalRecords: state.personalRecords.filter(pr => pr.exerciseId !== exerciseId),
        }))
        apiDelete(`/api/personal-records?exerciseId=${exerciseId}`)
      },
      
      // Training Plans
      trainingPlans: [],
      activeTrainingPlanId: null,
      addTrainingPlan: (plan) => {
        const tempId = `plan-${Date.now()}`
        const newPlan: TrainingPlan = {
          ...plan,
          id: tempId,
        }
        set((state) => ({
          trainingPlans: [...state.trainingPlans, newPlan],
          activeTrainingPlanId: tempId,
        }))

        fetch('/api/training-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plan),
        })
          .then((r) => {
            if (!r.ok) throw new Error('Failed to save plan')
            return r.json()
          })
          .then((saved) => {
            set((state) => ({
              trainingPlans: state.trainingPlans.map((p) =>
                p.id === tempId ? { ...p, id: saved.id } : p
              ),
              activeTrainingPlanId:
                state.activeTrainingPlanId === tempId ? saved.id : state.activeTrainingPlanId,
            }))
            // Activate it on the server too
            fetch(`/api/training-plans/${saved.id}/activate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: '{}',
            }).catch(() => {})
          })
          .catch(() => {})
      },
      updateTrainingPlan: (id, updates) => {
        set((state) => ({
          trainingPlans: state.trainingPlans.map(plan => 
            plan.id === id ? { ...plan, ...updates } : plan
          )
        }))

        // Sync to server — send full plan days so the backend can reconcile
        const updated = get().trainingPlans.find(p => p.id === id)
        if (updated && !id.startsWith('plan-')) {
          fetch('/api/training-plans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: updated.id,
              name: updated.name,
              durationWeeks: updated.durationWeeks,
              startDate: updated.startDate,
              days: updated.days.map(d => ({
                day: d.day,
                isRest: d.isRest ?? false,
                exercises: d.exercises,
              })),
            }),
          }).catch(() => {})
        }
      },
      deleteTrainingPlan: (id) => {
        set((state) => ({
          trainingPlans: state.trainingPlans.filter(plan => plan.id !== id),
          activeTrainingPlanId: state.activeTrainingPlanId === id ? null : state.activeTrainingPlanId
        }))
        apiDelete(`/api/training-plans?id=${id}`)
      },
      setActiveTrainingPlan: (id) => {
        set({ activeTrainingPlanId: id })
        if (id) {
          apiPost(`/api/training-plans/${id}/activate`, {})
        }
      },
      
      // Check-ins
      checkIns: [],
      toggleCheckIn: (date) => {
        set((state) => {
          const existing = state.checkIns.find(c => c.date === date)
          if (existing) {
            return {
              checkIns: state.checkIns.map(c => 
                c.date === date ? { ...c, completed: !c.completed } : c
              )
            }
          }
          return { checkIns: [...state.checkIns, { date, completed: true }] }
        })
        apiPost('/api/check-ins', { date })
      },
      getStreak: () => {
        const checkIns = get().checkIns.filter(c => c.completed)
        if (checkIns.length === 0) return 0
        
        const sortedDates = checkIns
          .map(c => new Date(c.date))
          .sort((a, b) => b.getTime() - a.getTime())
        
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date(sortedDates[i])
          checkDate.setHours(0, 0, 0, 0)
          
          const expectedDate = new Date(today)
          expectedDate.setDate(today.getDate() - i)
          
          if (checkDate.getTime() === expectedDate.getTime()) {
            streak++
          } else if (i === 0 && checkDate.getTime() === new Date(today.getTime() - 86400000).getTime()) {
            // Yesterday counts as continuing streak
            streak++
          } else {
            break
          }
        }
        
        return streak
      },
      
      // Navigation
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Preferences
      weightUnit: 'lbs',
      setWeightUnit: (unit) => set({ weightUnit: unit }),

      // Load all data from server APIs into the store
      loadFromServer: async () => {
        try {
          const [userRes, exercisesRes, workoutsRes, prsRes, plansRes, checkInsRes] =
            await Promise.all([
              fetch('/api/user'),
              fetch('/api/exercises'),
              fetch('/api/workouts'),
              fetch('/api/personal-records'),
              fetch('/api/training-plans'),
              fetch('/api/check-ins'),
            ])

          // If any returns 401, user's not logged in — skip
          if (!userRes.ok) {
            set({ isLoaded: true })
            return
          }

          const [user, exercises, workouts, prs, plans, checkIns] = await Promise.all([
            userRes.json(),
            exercisesRes.json(),
            workoutsRes.json(),
            prsRes.json(),
            plansRes.json(),
            checkInsRes.json(),
          ])

          // Map DB exercises to store format
          const mappedExercises: Exercise[] = (exercises || []).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            name: e.name as string,
            muscleGroup: e.muscleGroup as MuscleGroup,
            icon: (e.icon as string) || 'Dumbbell',
            difficulty: (e.difficulty as string) || 'beginner',
            isCustom: !!e.isCustom,
          }))

          // Map workout logs
          const mappedLogs: WorkoutLog[] = (workouts || []).map((w: Record<string, unknown>) => ({
            id: w.id as string,
            exerciseId: w.exerciseId as string,
            weight: w.weight as number,
            reps: w.reps as number,
            sets: w.sets as number,
            date: typeof w.date === 'string' ? w.date.split('T')[0] : String(w.date),
          }))

          // Map PRs
          const mappedPRs: PersonalRecord[] = (prs || []).map((p: Record<string, unknown>) => ({
            exerciseId: p.exerciseId as string,
            maxWeight: p.maxWeight as number,
            date: typeof p.date === 'string' ? p.date.split('T')[0] : String(p.date),
          }))

          // Map training plans — flatten nested DB structure to store format
          const activePlan = (plans || []).find((p: Record<string, unknown>) => p.isActive)
          interface DbExerciseRef { exercise: Record<string, unknown>; order: number }
          interface DbDay { day: string; isRest?: boolean; exercises: DbExerciseRef[] }
          interface DbPlan { id: string; name: string; isActive: boolean; durationWeeks?: number; startDate?: string | null; days: DbDay[] }
          const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          const mappedPlans: TrainingPlan[] = (plans || []).map((p: DbPlan) => ({
            id: p.id,
            name: p.name,
            durationWeeks: p.durationWeeks ?? 0,
            startDate: p.startDate ?? null,
            days: (p.days || []).map((d: DbDay) => ({
              day: d.day,
              isRest: d.isRest ?? false,
              exercises: (d.exercises || []).map((de: DbExerciseRef) => 
                (de.exercise as Record<string, unknown>).id as string
              ),
            })).sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)),
          }))

          // Map check-ins
          const mappedCheckIns: CheckIn[] = (checkIns || []).map((c: Record<string, unknown>) => ({
            date: c.date as string,
            completed: c.completed as boolean,
          }))

          // Preserve local plans if server returns empty (e.g. save failed earlier)
          const localPlans = get().trainingPlans
          const localActiveId = get().activeTrainingPlanId
          const hasServerPlans = mappedPlans.length > 0

          set({
            isLoaded: true,
            user: { name: user.name || 'Athlete', email: user.email || '' },
            exercises: mappedExercises.length > 0 ? mappedExercises : get().exercises,
            workoutLogs: mappedLogs,
            personalRecords: mappedPRs,
            trainingPlans: hasServerPlans ? mappedPlans : localPlans,
            activeTrainingPlanId: hasServerPlans
              ? (activePlan ? (activePlan as DbPlan).id : null)
              : localActiveId,
            checkIns: mappedCheckIns.length > 0 ? mappedCheckIns : get().checkIns,
          })

          // Re-save local-only plans to server
          if (!hasServerPlans && localPlans.length > 0) {
            for (const plan of localPlans) {
              if (plan.id.startsWith('plan-')) {
                fetch('/api/training-plans', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: plan.name,
                    durationWeeks: plan.durationWeeks,
                    startDate: plan.startDate,
                    days: plan.days.map(d => ({
                      day: d.day,
                      isRest: d.isRest ?? false,
                      exercises: d.exercises,
                    })),
                  }),
                })
                  .then(r => r.ok ? r.json() : null)
                  .then(saved => {
                    if (saved) {
                      set(state => ({
                        trainingPlans: state.trainingPlans.map(p =>
                          p.id === plan.id ? { ...p, id: saved.id } : p
                        ),
                        activeTrainingPlanId: state.activeTrainingPlanId === plan.id ? saved.id : state.activeTrainingPlanId,
                      }))
                      fetch(`/api/training-plans/${saved.id}/activate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: '{}',
                      }).catch(() => {})
                    }
                  })
                  .catch(() => {})
              }
            }
          }
        } catch {
          // If server is unreachable, keep whatever's in localStorage
          set({ isLoaded: true })
        }
      },
    }),
    {
      name: 'fitness-store',
      partialize: (state) => ({
        activeTab: state.activeTab,
        weightUnit: state.weightUnit,
        // Persist plan + exercise data as fallback until server sync completes
        trainingPlans: state.trainingPlans,
        activeTrainingPlanId: state.activeTrainingPlanId,
        exercises: state.exercises,
        checkIns: state.checkIns,
      }),
    }
  )
)
