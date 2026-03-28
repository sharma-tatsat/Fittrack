import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId } from '@/lib/api-auth'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId()
  if (userId instanceof NextResponse) return userId

  const { id } = await params

  // Verify ownership
  const plan = await prisma.trainingPlan.findFirst({
    where: { id, userId },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Deactivate all other plans, activate this one
  await prisma.$transaction([
    prisma.trainingPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    }),
    prisma.trainingPlan.update({
      where: { id },
      data: { isActive: true },
    }),
  ])

  return NextResponse.json({ message: 'Plan activated' })
}
