"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-slate-600">
          {error.message || "An unexpected error occurred. Please try again later."}
        </p>
        <div className="mt-6 flex gap-4">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go to home
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-500">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
} 