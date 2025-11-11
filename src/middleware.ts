import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.isAdmin || false;
  const { pathname } = req.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      // Redirect to signin if not logged in
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    if (!isAdmin) {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/earner/listings', req.url));
    }
  }

  // Check if accessing protected routes (earner/recruiter)
  if ((pathname.startsWith('/earner') || pathname.startsWith('/recruiter')) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/earner/:path*', '/recruiter/:path*', '/admin/:path*'],
};

