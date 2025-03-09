"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setIsClient(true);
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl rounded-lg border border-red-100 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mb-6 text-center text-gray-600">
          We encountered an error while loading this page.
        </p>

        {isClient && (
          <div className="mb-6 overflow-auto rounded bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold">Error details:</p>
            <p className="text-xs font-mono text-red-600">{error.message}</p>
            {error.digest && (
              <p className="mt-1 text-xs font-mono text-gray-500">Digest: {error.digest}</p>
            )}
            <p className="mt-2 text-xs font-mono text-gray-500">URL: {currentUrl}</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go to home
          </Button>
        </div>
      </div>
    </div>
  );
} 