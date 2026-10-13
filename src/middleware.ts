import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/profile', '/notifications'] // inferred, see note below

const roleRoutes: Record<string, string[]> = {
  admin: ['/dashboard/admin'],
  professor: ['/dashboard/professor'],
  student: ['/dashboard/student'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const session = await getSessionFromRequest(request)

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = session.role
  const allowedRoutes = roleRoutes[userRole] || []

  const dashboardMatch = pathname.match(/^\/dashboard\/(\w+)/)
  if (dashboardMatch) {
    const requestedRole = dashboardMatch[1]

    if (requestedRole !== userRole && userRole !== 'admin') {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
    }

    if (userRole === 'admin') {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/notifications/:path*'],
}