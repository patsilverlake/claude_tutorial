"use client"

import React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"
import { useUnreadState } from "@/lib/store/use-unread-state"

export function MobileToggle() {
  const { toggle, isOpen } = useSidebarState()
  const isMd = useMd()
  const { channelUnreads, dmUnreads, channelMentions } = useUnreadState()
  
  // Calculate total unread count
  const totalUnreads = Object.values(channelUnreads).reduce((a, b) => a + b, 0) + 
                      Object.values(dmUnreads).reduce((a, b) => a + b, 0)
  
  // Check if there are any mentions
  const hasMentions = Object.values(channelMentions).some(Boolean)
  
  // Only show on mobile
  if (isMd) return null
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggle}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Unread indicator */}
      {!isOpen && totalUnreads > 0 && (
        <div className="absolute -top-1 -right-1">
          {hasMentions ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              @
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {totalUnreads > 99 ? '99+' : totalUnreads}
            </span>
          )}
        </div>
      )}
    </div>
  )
} 