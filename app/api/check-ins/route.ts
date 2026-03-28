import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'
import { z } from 'zod'

export async function GET() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(checkIns)
}

const toggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const body = await request.json()
  const parsed = toggleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 })
  }

  const { date } = parsed.data

  // Toggle: if exists flip completed, otherwise create
  const existing = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date } },
  })

  let checkIn
  if (existing) {
    checkIn = await prisma.checkIn.update({
      where: { id: existing.id },
      data: { completed: !existing.completed },
    })
  } else {
    checkIn = await prisma.checkIn.create({
      data: { date, completed: true, userId },
    })
  }

  return NextResponse.json(checkIn)
}
