import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Debug middleware function to help diagnose routing issues
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Add debugging headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Debug-Path', pathname);
  
  // Root redirect
  if (pathname === '/') {
    console.log('Middleware: Redirecting root path to /main');
    url.pathname = '/main';
    return NextResponse.redirect(url);
  }

  // Special handling for channel routes
  if (pathname.startsWith('/channels/') && !pathname.includes('[channelId]')) {
    const channelId = pathname.split('/')[2]; // Extract the channel ID
    
    // If this is a direct channel URL (not a search or thread)
    if (pathname === `/channels/${channelId}`) {
      // Log for debugging
      console.log(`Processing channel route for ID: ${channelId}`);
      
      // Make sure query parameter is present
      url.searchParams.set('channelId', channelId);
      return NextResponse.rewrite(url);
    }
  }

  // Handle route group access - redirect to the standard route
  if (pathname.startsWith('/(main)')) {
    console.log(`Middleware: Redirecting route group path: ${pathname}`);
    const newPath = pathname.replace('/(main)', '/main');
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  return response;
}

// Configure matcher for the middleware
export const config = {
  matcher: [
    // Match specific routes that need handling
    '/',
    '/channels/:path*',
    '/dm/:path*',
    '/(main)',
    '/(main)/:path*',
  ]
}; 