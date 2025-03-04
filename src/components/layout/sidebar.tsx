"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Users, Settings, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen } = useSidebarState()
  const isMd = useMd()
  
  // On desktop, always show sidebar
  // On mobile, only show if isOpen is true
  const showSidebar = isMd || isOpen
  
  if (!showSidebar) return null
  
  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-60 flex-col bg-slate-950 md:relative",
        className
      )} 
      {...props}
    >
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <Link href="/main" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white">Slack Clone</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 px-4 text-sm font-semibold text-slate-400">
              Channels
            </h3>
            <div className="space-y-1">
              {/* Channel list will be added in Step 10 */}
              <div className="flex items-center px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md">
                <span># general</span>
              </div>
              <div className="flex items-center px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md">
                <span># random</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 mt-2 text-sm text-slate-400 hover:text-white">
              <PlusCircle className="h-4 w-4" />
              <span>Add Channel</span>
            </button>
          </div>
          <div>
            <h3 className="mb-2 px-4 text-sm font-semibold text-slate-400">
              Direct Messages
            </h3>
            <div className="space-y-1">
              {/* DM list will be added in Step 16 */}
              <div className="flex items-center px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md">
                <span>Slackbot</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="flex h-14 items-center border-t border-slate-800 px-4">
        <button className="flex items-center gap-2 text-slate-400 hover:text-white">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  )
} 