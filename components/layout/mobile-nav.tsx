'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Dumbbell, 
  Timer, 
  CalendarDays, 
  User 
} from 'lucide-react'
import { useFitnessStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'exercises', label: 'Exercises', icon: Dumbbell, color: 'text-emerald-500' },
  { id: 'tracker', label: 'Workout', icon: Timer, color: 'text-amber-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'text-rose-500' },
  { id: 'profile', label: 'Profile', icon: User, color: 'text-cyan-500' },
]

export function MobileNav() {
  const { activeTab, setActiveTab } = useFitnessStore()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 bg-primary/15 rounded-2xl shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -2 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <item.icon className={cn(
                  "w-5 h-5 relative z-10 transition-colors",
                  isActive ? "text-primary" : item.color
                )} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-semibold relative z-10 transition-colors",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-dot"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
