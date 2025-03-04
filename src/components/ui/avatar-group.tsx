"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    name: string
    image?: string
  }[]
  limit?: number
}

export function AvatarGroup({
  items,
  limit = 3,
  className,
  ...props
}: AvatarGroupProps) {
  const itemsToShow = items.slice(0, limit)
  const remainingCount = Math.max(items.length - limit, 0)

  return (
    <div
      className={cn("flex items-center justify-center -space-x-2", className)}
      {...props}
    >
      {itemsToShow.map((item) => (
        <Avatar
          key={item.name}
          className="border-2 border-background"
        >
          {item.image ? (
            <AvatarImage src={item.image} alt={item.name} />
          ) : (
            <AvatarFallback>
              {item.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted">
          <div className="flex h-full w-full items-center justify-center text-xs font-medium">
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  )
} 