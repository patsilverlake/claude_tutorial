import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageSkeletonProps {
  count?: number;
}

export function MessageSkeleton({ count = 5 }: MessageSkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChannelHeaderSkeleton() {
  return (
    <div className="border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>
      <Skeleton className="mt-1 h-4 w-64" />
    </div>
  );
}

export function MessageInputSkeleton() {
  return (
    <div className="p-4 border-t border-slate-200">
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export function FullChannelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <ChannelHeaderSkeleton />
      <div className="flex-1 overflow-hidden">
        <MessageSkeleton />
      </div>
      <MessageInputSkeleton />
    </div>
  );
} 