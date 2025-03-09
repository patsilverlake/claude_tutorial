"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  label?: string;
  className?: string;
}

export function RefreshButton({ 
  onRefresh, 
  label = "Refresh", 
  className 
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn("gap-1", className)}
    >
      <RefreshCw 
        className={cn(
          "h-3.5 w-3.5", 
          isRefreshing && "animate-spin"
        )} 
      />
      {label}
    </Button>
  );
} 