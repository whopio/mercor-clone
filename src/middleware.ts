export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/earner/:path*', '/recruiter/:path*', '/admin/:path*'],
};

