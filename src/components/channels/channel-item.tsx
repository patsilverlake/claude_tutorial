"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Channel } from "@/types";
import { useUnreadState } from "@/lib/store/use-unread-state";

interface ChannelItemProps {
  channel: Channel;
}

export function ChannelItem({ channel }: ChannelItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/channels/${channel.id}`;
  
  // Get unread state
  const { channelUnreads, channelMentions, markChannelAsRead } = useUnreadState();
  const unreadCount = channelUnreads[channel.id] || 0;
  const hasMention = channelMentions[channel.id] || false;
  
  // Mark channel as read when it becomes active
  React.useEffect(() => {
    if (isActive && unreadCount > 0) {
      markChannelAsRead(channel.id);
    }
  }, [isActive, channel.id, unreadCount, markChannelAsRead]);
  
  return (
    <Link
      href={`/channels/${channel.id}`}
      className={cn(
        "flex items-center px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors",
        isActive && "bg-slate-800 text-white",
        unreadCount > 0 && !isActive && "font-semibold text-white"
      )}
    >
      <span className="mr-1">#</span>
      <span className="truncate">{channel.name}</span>
      
      {/* Unread indicator */}
      {unreadCount > 0 && !isActive && (
        <div className="ml-auto flex items-center">
          {hasMention ? (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              @
            </span>
          ) : (
            <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
          )}
        </div>
      )}
    </Link>
  );
} 