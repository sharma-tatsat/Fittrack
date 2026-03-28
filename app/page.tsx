'use client'

import { useEffect } from 'react'
import { useFitnessStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Dashboard } from '@/components/dashboard/dashboard'
import { ExercisesList } from '@/components/exercises/exercises-list'
import { WorkoutTracker } from '@/components/workout/workout-tracker'
import { TrainingPlanner } from '@/components/planner/training-planner'
import { CalendarView } from '@/components/calendar/calendar-view'
import { ProfileSettings } from '@/components/profile/profile-settings'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

function MainContent() {
  const { activeTab } = useFitnessStore()

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'exercises':
        return <ExercisesList />
      case 'tracker':
        return <WorkoutTracker />
      case 'planner':
        return <TrainingPlanner />
      case 'calendar':
        return <CalendarView />
      case 'profile':
        return <ProfileSettings />
      default:
        return <Dashboard />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  )
}

export default function FitnessApp() {
  const { isLoaded, loadFromServer } = useFitnessStore()

  useEffect(() => {
    loadFromServer()
  }, [loadFromServer])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "md:ml-[280px]", // Default sidebar width
        "pb-24 md:pb-8" // Space for mobile nav
      )}>
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <MainContent />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
