"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ChannelRedirectProps {
  channelId: string;
}

export function ChannelRedirect({ channelId }: ChannelRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.push(`/channels/${channelId}`);
  }, [channelId, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-4" />
      <p className="text-slate-600">Redirecting to channel...</p>
    </div>
  );
} 