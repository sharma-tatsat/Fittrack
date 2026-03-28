import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const exercises = await prisma.exercise.findMany({
    where: { userId },
    orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(exercises)
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.enum(['chest', 'back', 'legs', 'shoulders', 'arms', 'core']),
  icon: z.string().default('Dumbbell'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const exercise = await prisma.exercise.create({
    data: {
      ...parsed.data,
      isCustom: true,
      userId,
    },
  })

  return NextResponse.json(exercise, { status: 201 })
}
