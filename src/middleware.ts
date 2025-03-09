import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Debug middleware function to help diagnose routing issues
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Add debugging headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Debug-Path', pathname);
  
  // Handle root redirect
  if (pathname === '/') {
    console.log('Middleware: Redirecting root path to /main');
    url.pathname = '/main';
    return NextResponse.redirect(url);
  }

  // Handle specific routes
  if (pathname.startsWith('/channels/') && !pathname.includes('[channelId]')) {
    // Log channel path info
    console.log(`Middleware: Processing channel path: ${pathname}`);
  }

  if (pathname.startsWith('/dm/') && !pathname.includes('[userId]')) {
    // Log DM path info
    console.log(`Middleware: Processing DM path: ${pathname}`);
  }

  // Handle legacy route group
  if (pathname.startsWith('/(main)')) {
    console.log(`Middleware: Redirecting route group path: ${pathname}`);
    const newPath = pathname.replace('/(main)', '/main');
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/',
    '/channels/:path*',
    '/dm/:path*',
    '/mentions',
    '/(main)/:path*',
  ],
}; 