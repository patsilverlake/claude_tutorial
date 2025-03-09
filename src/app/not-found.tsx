'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [url, setUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUrl(window.location.href);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Search className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        {isClient && (
          <div className="mt-4 p-3 bg-slate-100 rounded text-left w-full overflow-auto">
            <p className="text-xs font-mono break-all">Current URL: {url}</p>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/">
              Go to home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/main">
              Go to main
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 