import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const plans = await prisma.trainingPlan.findMany({
    where: { userId },
    include: {
      days: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { day: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(plans)
}

const daySchema = z.object({
  day: z.string().min(1),
  exercises: z.array(z.string()), // exercise IDs
  isRest: z.boolean().optional().default(false),
})

const createSchema = z.object({
  name: z.string().min(1).max(100),
  durationWeeks: z.number().int().min(0).max(520).optional().default(0),
  startDate: z.string().nullable().optional().default(null),
  days: z.array(daySchema),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, durationWeeks, startDate, days } = parsed.data

  const plan = await prisma.trainingPlan.create({
    data: {
      name,
      durationWeeks: durationWeeks ?? 0,
      startDate: startDate ?? null,
      userId,
      days: {
        create: days.map((d) => ({
          day: d.day,
          isRest: d.isRest ?? false,
          exercises: {
            create: d.exercises.map((exerciseId, index) => ({
              exerciseId,
              order: index,
            })),
          },
        })),
      },
    },
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
  })

  return NextResponse.json(plan, { status: 201 })
}

// ─── PUT: update a training plan's days (exercises + isRest) ────────

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  durationWeeks: z.number().int().min(0).max(520).optional(),
  startDate: z.string().nullable().optional(),
  days: z.array(daySchema),
})

export async function PUT(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { id, name, durationWeeks, startDate, days } = parsed.data

  // Verify ownership
  const existing = await prisma.trainingPlan.findFirst({
    where: { id, userId },
    include: { days: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Update plan metadata
  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (durationWeeks !== undefined) updateData.durationWeeks = durationWeeks
  if (startDate !== undefined) updateData.startDate = startDate
  if (Object.keys(updateData).length > 0) {
    await prisma.trainingPlan.update({ where: { id }, data: updateData })
  }

  // Replace all days atomically — delete everything and re-create
  await prisma.$transaction(async (tx) => {
    // Delete all existing days (cascade deletes TrainingDayExercise)
    await tx.trainingDay.deleteMany({ where: { trainingPlanId: id } })

    // Re-create all days with exercises
    for (const d of days) {
      await tx.trainingDay.create({
        data: {
          day: d.day,
          isRest: d.isRest ?? false,
          trainingPlanId: id,
          exercises: {
            create: d.exercises.map((exerciseId, index) => ({
              exerciseId,
              order: index,
            })),
          },
        },
      })
    }
  })

  return NextResponse.json({ message: 'Plan updated' })
}

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(request.url)
  const planId = searchParams.get('id')

  if (!planId) {
    return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
  }

  // Verify ownership
  const plan = await prisma.trainingPlan.findFirst({
    where: { id: planId, userId },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  await prisma.trainingPlan.delete({ where: { id: planId } })

  return NextResponse.json({ message: 'Plan deleted' })
}
