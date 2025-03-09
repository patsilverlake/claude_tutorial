"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Users, Settings, AtSign } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"
import { ChannelList } from "@/components/channels/channel-list"
import { DMList } from "@/components/dm/dm-list"
import { useUnreadState } from "@/lib/store/use-unread-state"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen } = useSidebarState()
  const isMd = useMd()
  const pathname = usePathname()
  
  // On desktop, always show sidebar
  // On mobile, only show if isOpen is true
  if (!isOpen && !isMd) {
    return null
  }
  
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col bg-slate-900 text-white",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <h1 className="text-xl font-bold">Slack Clone</h1>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 p-2">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase text-slate-400">Channels</h2>
              </div>
              <ChannelList />
            </div>
            
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold uppercase text-slate-400">Direct Messages</h2>
              <DMList />
            </div>
            <div className="px-3 py-2">
              <Link
                href="/mentions"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors",
                  pathname === "/mentions" && "bg-slate-800 text-white"
                )}
              >
                <AtSign className="h-5 w-5" />
                <span>Mentions</span>
              </Link>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 