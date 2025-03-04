"use client"

import React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"

export function MobileToggle() {
  const { toggle } = useSidebarState()
  const isMd = useMd()
  
  // Only show on mobile
  if (isMd) return null
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggle}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
} 