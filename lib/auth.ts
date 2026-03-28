import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/lib/auth.config'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] authorize called')
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) {
            console.log('[Auth] validation failed:', parsed.error.errors)
            return null
          }

          const { email, password } = parsed.data
          console.log('[Auth] looking up user:', email.toLowerCase())

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          })

          if (!user || !user.password) {
            console.log('[Auth] user not found or no password')
            return null
          }

          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) {
            console.log('[Auth] password mismatch')
            return null
          }

          console.log('[Auth] login success for:', user.id)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error('[Auth] authorize error:', error instanceof Error ? { message: error.message, stack: error.stack } : error)
          return null
        }
      },
    }),
  ],
})
