import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChannelSkeletonProps {
  count?: number;
}

export function ChannelSkeleton({ count = 5 }: ChannelSkeletonProps) {
  return (
    <div className="space-y-1 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-4 py-2">
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DMSkeleton({ count = 5 }: ChannelSkeletonProps) {
  return (
    <div className="space-y-1 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-4 py-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <Skeleton className="h-6 w-32 bg-slate-700" />
      </div>
      
      <div className="flex-1 p-2 space-y-6">
        <div className="px-3 py-2">
          <Skeleton className="h-4 w-16 mb-2 bg-slate-700" />
          <ChannelSkeleton />
        </div>
        
        <div className="px-3 py-2">
          <Skeleton className="h-4 w-32 mb-2 bg-slate-700" />
          <DMSkeleton />
        </div>
      </div>
    </div>
  );
} 