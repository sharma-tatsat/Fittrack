import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    // Match all routes except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|manifest|.*\\.png$|.*\\.svg$).*)',
  ],
}
