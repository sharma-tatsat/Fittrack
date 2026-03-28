import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

/**
 * Auth config that doesn't import Prisma - safe for Edge Runtime (middleware).
 * The actual DB calls happen in auth.ts via the authorize callback override.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize is overridden in auth.ts where Prisma is available
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      const publicRoutes = ['/login', '/signup']
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
      const isAuthApi = pathname.startsWith('/api/auth')

      if (isPublicRoute || isAuthApi) return true
      if (!isLoggedIn) return false
      return true
    },
  },
  session: { strategy: 'jwt' },
}
