import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function runs on every request
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Root redirect
  if (pathname === '/') {
    url.pathname = '/main';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run this middleware on specific paths
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 