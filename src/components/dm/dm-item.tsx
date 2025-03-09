"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DMItemProps {
  user: User;
}

export function DMItem({ user }: DMItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/dm/${user.id}`;
  
  return (
    <Link
      href={`/dm/${user.id}`}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors",
        isActive && "bg-slate-800 text-white"
      )}
    >
      <Avatar className="h-6 w-6">
        {user.imageUrl ? (
          <AvatarImage src={user.imageUrl} alt={user.name} />
        ) : (
          <AvatarFallback>
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="truncate">{user.name}</span>
    </Link>
  );
} 