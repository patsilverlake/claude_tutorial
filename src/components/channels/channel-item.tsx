"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Channel } from "@/types";

interface ChannelItemProps {
  channel: Channel;
}

export function ChannelItem({ channel }: ChannelItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/channels/${channel.id}`;
  
  return (
    <Link
      href={`/channels/${channel.id}`}
      className={cn(
        "flex items-center px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors",
        isActive && "bg-slate-800 text-white"
      )}
    >
      <span className="mr-1">#</span>
      <span className="truncate">{channel.name}</span>
    </Link>
  );
} 