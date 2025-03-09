'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteDebugger() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV !== 'production');

  useEffect(() => {
    // Check for special query param to force showing even in production
    if (searchParams?.has('debug')) {
      setIsVisible(true);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 font-mono">
      <div className="max-w-6xl mx-auto">
        <div>
          <strong>Path:</strong> {pathname}
        </div>
        <div>
          <strong>Query:</strong>{' '}
          {searchParams ? JSON.stringify(Object.fromEntries(searchParams)) : 'None'}
        </div>
      </div>
    </div>
  );
} 