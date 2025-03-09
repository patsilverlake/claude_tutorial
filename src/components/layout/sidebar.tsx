"use client"

import React, { useEffect } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Users, Settings, AtSign, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"
import { ChannelList } from "@/components/channels/channel-list"
import { DMList } from "@/components/dm/dm-list"
import { useUnreadState } from "@/lib/store/use-unread-state"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen, close } = useSidebarState()
  const isMd = useMd()
  const pathname = usePathname()
  
  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (!isMd) {
      close();
    }
  }, [pathname, isMd, close]);
  
  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && !isMd) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMd]);
  
  // On desktop, always show sidebar
  // On mobile, only show if isOpen is true
  if (!isOpen && !isMd) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && !isMd && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 transition-opacity animate-in fade-in"
          onClick={close}
          aria-hidden="true"
        />
      )}
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-[280px] flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out",
          !isMd && !isOpen && "-translate-x-full",
          !isMd && isOpen && "translate-x-0 shadow-lg",
          isMd && "relative w-64 shadow-none",
          className
        )}
        {...props}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
          <h1 className="text-xl font-bold">Slack Clone</h1>
          {!isMd && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-white"
              onClick={close}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
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
    </>
  )
} 