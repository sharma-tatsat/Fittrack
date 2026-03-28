import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const records = await prisma.personalRecord.findMany({
    where: { userId },
    include: { exercise: { select: { name: true, muscleGroup: true, icon: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(records)
}

const updateSchema = z.object({
  exerciseId: z.string().min(1),
  maxWeight: z.number().positive(),
})

export async function PATCH(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { exerciseId, maxWeight } = parsed.data

  // Verify exercise belongs to user
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
  })
  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  const record = await prisma.personalRecord.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    create: { exerciseId, userId, maxWeight, date: new Date() },
    update: { maxWeight, date: new Date() },
  })

  return NextResponse.json(record)
}

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const { searchParams } = new URL(request.url)
  const exerciseId = searchParams.get('exerciseId')

  if (!exerciseId) {
    return NextResponse.json({ error: 'exerciseId is required' }, { status: 400 })
  }

  await prisma.personalRecord.deleteMany({
    where: { userId, exerciseId },
  })

  return NextResponse.json({ success: true })
}
