import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'

export async function POST() {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  // Delete all workout logs, personal records, and check-ins for this user
  await prisma.$transaction([
    prisma.workoutLog.deleteMany({ where: { userId } }),
    prisma.personalRecord.deleteMany({ where: { userId } }),
    prisma.checkIn.deleteMany({ where: { userId } }),
  ])

  return NextResponse.json({ success: true })
}
