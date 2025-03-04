"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Search, Bell, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileToggle } from "./mobile-toggle"

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function Header({ title = "Slack Clone", className, ...props }: HeaderProps) {
  return (
    <header 
      className={cn(
        "flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4",
        className
      )} 
      {...props}
    >
      <div className="flex items-center gap-3">
        <MobileToggle />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <button className="text-slate-500 hover:text-slate-900">
          <Bell className="h-5 w-5" />
        </button>
        <button className="text-slate-500 hover:text-slate-900">
          <HelpCircle className="h-5 w-5" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 