'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main page in the with-sidebar route group
    router.push('/main');
  }, [router]);
  
  // Return a simple loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-12 w-12 border-4 border-t-blue-500 border-slate-200 rounded-full animate-spin mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}
