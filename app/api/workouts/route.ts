import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(request.url)
  const exerciseId = searchParams.get('exerciseId')

  const where: Record<string, unknown> = { userId }
  if (exerciseId) where.exerciseId = exerciseId

  const logs = await prisma.workoutLog.findMany({
    where,
    include: { exercise: { select: { name: true, muscleGroup: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })

  return NextResponse.json(logs)
}

const createSchema = z.object({
  exerciseId: z.string().min(1),
  weight: z.number().positive(),
  reps: z.number().int().positive(),
  sets: z.number().int().positive(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { exerciseId, weight, reps, sets, date } = parsed.data

  // Verify the exercise belongs to this user
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
  })

  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  // Create workout log
  const log = await prisma.workoutLog.create({
    data: {
      exerciseId,
      weight,
      reps,
      sets,
      date: new Date(date),
      userId,
    },
  })

  // Check and update personal record
  let isNewPR = false
  const currentPR = await prisma.personalRecord.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
  })

  if (!currentPR || weight > currentPR.maxWeight) {
    isNewPR = true
    await prisma.personalRecord.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      create: {
        exerciseId,
        userId,
        maxWeight: weight,
        date: new Date(date),
      },
      update: {
        maxWeight: weight,
        date: new Date(date),
      },
    })
  }

  return NextResponse.json({ log, isNewPR }, { status: 201 })
}
