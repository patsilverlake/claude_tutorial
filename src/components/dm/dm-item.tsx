"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnreadState } from "@/lib/store/use-unread-state";

interface DMItemProps {
  user: User;
}

export function DMItem({ user }: DMItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/dm/${user.id}`;
  
  // Get unread state
  const { dmUnreads, markDmAsRead } = useUnreadState();
  const unreadCount = dmUnreads[user.id] || 0;
  
  // Mark DM as read when it becomes active
  React.useEffect(() => {
    if (isActive && unreadCount > 0) {
      markDmAsRead(user.id);
    }
  }, [isActive, user.id, unreadCount, markDmAsRead]);
  
  return (
    <Link
      href={`/dm/${user.id}`}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors",
        isActive && "bg-slate-800 text-white",
        unreadCount > 0 && !isActive && "font-semibold text-white"
      )}
    >
      <div className="relative">
        <Avatar className="h-6 w-6">
          {user.imageUrl ? (
            <AvatarImage src={user.imageUrl} alt={user.name} />
          ) : (
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Online indicator */}
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></span>
      </div>
      <span className="truncate">{user.name}</span>
      
      {/* Unread indicator */}
      {unreadCount > 0 && !isActive && (
        <div className="ml-auto">
          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </Link>
  );
} 