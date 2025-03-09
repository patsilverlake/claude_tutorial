import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function runs on every request
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Check if the pathname is exactly '/'
  if (pathname === '/') {
    // Redirect to /main
    url.pathname = '/main';
    return NextResponse.redirect(url);
  }

  // Block access to the (main) route group - redirect to /main instead
  if (pathname.startsWith('/(main)') || pathname === '/(main)') {
    // Redirect to the corresponding path in /main
    const newPath = pathname.replace('/(main)', '/main');
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run this middleware on specific paths
export const config = {
  matcher: [
    // Match the root path and any paths in the (main) route group
    '/',
    '/(main)',
    '/(main)/:path*',
  ],
}; 