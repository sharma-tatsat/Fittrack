import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'

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
