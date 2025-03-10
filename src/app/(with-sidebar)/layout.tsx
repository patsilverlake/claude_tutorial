"use client"

import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/store/use-sidebar-state"
import { useMd } from "@/lib/hooks/use-media-query"

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, close } = useSidebarState()
  const isMd = useMd()
  
  // Show overlay only on mobile when sidebar is open
  const showOverlay = !isMd && isOpen
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Overlay for mobile */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
      
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
} 