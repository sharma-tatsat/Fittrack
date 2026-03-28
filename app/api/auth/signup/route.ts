import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    })

    // Seed default exercises for the new user
    const defaultExercises = getDefaultExercises(user.id)
    await prisma.exercise.createMany({ data: defaultExercises })

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error ? error.stack : undefined
    console.error('Signup error:', { message: errMsg, stack: errStack, name: error instanceof Error ? error.name : 'Unknown' })
    return NextResponse.json(
      { error: `Signup failed: ${errMsg}` },
      { status: 500 }
    )
  }
}

function getDefaultExercises(userId: string) {
  return [
    // Chest
    { name: 'Bench Press', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Incline Press', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Cable Fly', muscleGroup: 'chest', icon: 'Cable', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Dumbbell Fly', muscleGroup: 'chest', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Push Ups', muscleGroup: 'chest', icon: 'User', difficulty: 'beginner', isDefault: true, userId },
    // Back
    { name: 'Pull Ups', muscleGroup: 'back', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Lat Pulldown', muscleGroup: 'back', icon: 'ArrowDown', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Deadlift', muscleGroup: 'back', icon: 'Dumbbell', difficulty: 'advanced', isDefault: true, userId },
    { name: 'Barbell Rows', muscleGroup: 'back', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Cable Rows', muscleGroup: 'back', icon: 'Cable', difficulty: 'beginner', isDefault: true, userId },
    // Legs
    { name: 'Squats', muscleGroup: 'legs', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Leg Press', muscleGroup: 'legs', icon: 'Square', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Lunges', muscleGroup: 'legs', icon: 'Footprints', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Extensions', muscleGroup: 'legs', icon: 'Zap', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Curls', muscleGroup: 'legs', icon: 'Zap', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Calf Raises', muscleGroup: 'legs', icon: 'ArrowUp', difficulty: 'beginner', isDefault: true, userId },
    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'shoulders', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Lateral Raises', muscleGroup: 'shoulders', icon: 'Expand', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Front Raises', muscleGroup: 'shoulders', icon: 'ArrowUp', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Rear Delt Fly', muscleGroup: 'shoulders', icon: 'Expand', difficulty: 'beginner', isDefault: true, userId },
    // Arms
    { name: 'Bicep Curls', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Hammer Curls', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Tricep Pushdowns', muscleGroup: 'arms', icon: 'ArrowDown', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Tricep Dips', muscleGroup: 'arms', icon: 'ArrowDown', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Skull Crushers', muscleGroup: 'arms', icon: 'Dumbbell', difficulty: 'intermediate', isDefault: true, userId },
    // Core
    { name: 'Crunches', muscleGroup: 'core', icon: 'Target', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Planks', muscleGroup: 'core', icon: 'Minus', difficulty: 'beginner', isDefault: true, userId },
    { name: 'Leg Raises', muscleGroup: 'core', icon: 'ArrowUp', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Russian Twists', muscleGroup: 'core', icon: 'RotateCw', difficulty: 'intermediate', isDefault: true, userId },
    { name: 'Mountain Climbers', muscleGroup: 'core', icon: 'Mountain', difficulty: 'intermediate', isDefault: true, userId },
  ]
}
