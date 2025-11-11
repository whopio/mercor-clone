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
      const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin) {
      // Redirect to home if not admin
      const homeUrl = new URL('/earner/listings', req.nextUrl.origin);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Check if accessing protected routes (earner/recruiter)
  if ((pathname.startsWith('/earner') || pathname.startsWith('/recruiter')) && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/earner/:path*', '/recruiter/:path*', '/admin/:path*'],
};

