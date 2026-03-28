import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'

export async function GET() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalWorkouts,
    weeklyWorkouts,
    personalRecords,
    checkIns,
    recentPRs,
    activePlan,
  ] = await Promise.all([
    // Total workout logs
    prisma.workoutLog.count({ where: { userId } }),
    // Workouts this week
    prisma.workoutLog.findMany({
      where: { userId, date: { gte: weekAgo } },
      include: { exercise: { select: { muscleGroup: true } } },
    }),
    // Total PRs
    prisma.personalRecord.count({ where: { userId } }),
    // Check-ins this week
    prisma.checkIn.count({
      where: {
        userId,
        completed: true,
        date: { gte: weekAgo.toISOString().split('T')[0] },
      },
    }),
    // Recent PRs
    prisma.personalRecord.findMany({
      where: { userId },
      include: { exercise: { select: { name: true, muscleGroup: true, icon: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    // Active training plan
    prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    }),
  ])

  // Calculate streak
  const allCheckIns = await prisma.checkIn.findMany({
    where: { userId, completed: true },
    orderBy: { date: 'desc' },
  })

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < allCheckIns.length; i++) {
    const checkDate = new Date(allCheckIns[i].date)
    checkDate.setHours(0, 0, 0, 0)

    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)

    if (checkDate.getTime() === expectedDate.getTime()) {
      streak++
    } else if (i === 0) {
      // Allow yesterday to continue streak
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      if (checkDate.getTime() === yesterday.getTime()) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
  }

  // Muscle group breakdown
  const muscleGroups: Record<string, number> = {}
  weeklyWorkouts.forEach((w) => {
    const mg = w.exercise.muscleGroup
    muscleGroups[mg] = (muscleGroups[mg] || 0) + w.sets
  })

  return NextResponse.json({
    totalWorkouts,
    weeklyWorkoutCount: weeklyWorkouts.length,
    weeklySets: weeklyWorkouts.reduce((sum, w) => sum + w.sets, 0),
    personalRecordCount: personalRecords,
    weeklyCheckIns: checkIns,
    streak,
    recentPRs,
    activePlan,
    muscleGroupBreakdown: muscleGroups,
  })
}
