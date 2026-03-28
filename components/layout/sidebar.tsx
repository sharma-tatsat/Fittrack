'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Dumbbell, 
  Timer, 
  CalendarDays, 
  User,
  Flame,
  ChevronLeft,
  ChevronRight,
  Zap,
  ListChecks
} from 'lucide-react'
import { useFitnessStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell, color: 'text-emerald-500' },
  { id: 'tracker', label: 'Workout', icon: Timer, color: 'text-amber-500' },
  { id: 'planner', label: 'Plan', icon: ListChecks, color: 'text-violet-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'text-rose-500' },
  { id: 'profile', label: 'Profile', icon: User, color: 'text-cyan-500' },
]

export function Sidebar() {
  const { activeTab, setActiveTab, getStreak } = useFitnessStore()
  const [collapsed, setCollapsed] = useState(false)
  const streak = getStreak()

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col h-screen bg-card border-r border-border fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Zap className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-xl">FitTrack</h1>
            <p className="text-xs text-muted-foreground">Your fitness companion</p>
          </motion.div>
        )}
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/20 to-amber-500/10 border border-primary/30",
            collapsed && "mx-2 p-2"
          )}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Flame className="w-6 h-6 text-primary" />
            </motion.div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-primary">{streak} Day Streak</p>
                <p className="text-xs text-muted-foreground">Keep it going!</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-primary-foreground" : item.color
              )} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-4 p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center justify-center group"
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </motion.div>
      </button>
    </motion.aside>
  )
}
