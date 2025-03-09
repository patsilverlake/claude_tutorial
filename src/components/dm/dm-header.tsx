"use client";

import React from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from "lucide-react";

interface DMHeaderProps {
  user: User;
}

export function DMHeader({ user }: DMHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          {user.imageUrl ? (
            <AvatarImage src={user.imageUrl} alt={user.name} />
          ) : (
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      <button className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
        <Info className="h-5 w-5" />
      </button>
    </div>
  );
} 