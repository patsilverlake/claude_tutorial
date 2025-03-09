"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Message } from "@/types";
import { MessageItem } from "./message-item";
import { useMessagesState } from "@/lib/store/use-messages-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageListProps {
  channelId: string;
  messages: Message[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  currentUserName?: string;
}

export function MessageList({ 
  channelId, 
  messages, 
  isLoading = false,
  onRefresh,
  currentUserName = ""
}: MessageListProps) {
  const { setMessages, messages: storeMessages } = useMessagesState();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const touchStartY = useRef(0);
  const pullThreshold = 80; // Distance in pixels to trigger refresh
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  console.log("Rendering MessageList for channel:", channelId);
  console.log("Messages received:", messages.length > 0 ? messages.map(m => ({ id: m.id, content: m.content.substring(0, 20) })) : "No messages");
  
  // Set up automatic refresh every 5 seconds
  useEffect(() => {
    const setupRefreshTimer = () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      refreshTimerRef.current = setTimeout(async () => {
        console.log("Auto-refreshing messages for channel:", channelId);
        if (onRefresh) {
          try {
            await onRefresh();
          } catch (error) {
            console.error("Error auto-refreshing messages:", error);
          }
        }
        setupRefreshTimer(); // Set up next refresh
      }, 5000); // 5 seconds
    };
    
    setupRefreshTimer();
    
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [channelId, onRefresh]);
  
  // Merge server messages with any local optimistic messages
  useEffect(() => {
    // Get the store messages for this channel
    const channelStoreMessages = storeMessages[channelId] || [];
    
    // Identify temporary messages (optimistic updates)
    const tempMessages = channelStoreMessages.filter(msg => msg.id.startsWith('temp-'));
    const serverMessageIds = new Set(messages.map(msg => msg.id));
    
    // Keep temp messages that aren't yet in the server response
    const tempMessagesToKeep = tempMessages.filter(msg => !serverMessageIds.has(msg.id));
    
    // Combine server messages with temporary messages
    const combinedMessages = [...messages, ...tempMessagesToKeep].map(msg => ({
      ...msg,
      channelId: msg.channelId || null, // Ensure channelId is string | null, not undefined
      parentId: msg.parentId || null // Ensure parentId is string | null, not undefined
    }));
    
    // Sort by creation date
    combinedMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    setLocalMessages(combinedMessages);
  }, [messages, storeMessages, channelId]);
  
  // Update the messages in the store when they change from the server
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Updating messages in store for channel:", channelId, "with", messages.length, "messages");
      // Convert the messages to the format expected by the store
      const storeMessages = messages.map(msg => ({
        ...msg,
        channelId: msg.channelId || undefined,
        parentId: msg.parentId || undefined
      }));
      
      // Get existing temp messages
      const existingMessages = useMessagesState.getState().messages[channelId] || [];
      const tempMessages = existingMessages.filter(msg => msg.id.startsWith('temp-'));
      
      // Merge server messages with temp messages
      setMessages(channelId, [...storeMessages, ...tempMessages] as any);
    }
  }, [channelId, messages, setMessages]);
  
  // Scroll to bottom when localMessages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh, isRefreshing]);
  
  // Handle touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable pull-to-refresh when scrolled to the top
    if (scrollAreaRef.current && scrollAreaRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    
    const touchY = e.touches[0].clientY;
    const distance = Math.max(0, touchY - touchStartY.current);
    
    // Apply resistance to make the pull feel natural
    const pullWithResistance = Math.min(distance * 0.4, pullThreshold * 1.5);
    setPullDistance(pullWithResistance);
    
    // Prevent default scrolling behavior when pulling
    if (distance > 10) {
      e.preventDefault();
    }
  }, [isPulling]);
  
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= pullThreshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, pullDistance, onRefresh, isRefreshing]);
  
  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (localMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-slate-500 max-w-md">
          Be the first to send a message in this channel!
        </p>
        {onRefresh && (
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh Messages
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className="flex-1 relative"
      onTouchStart={onRefresh ? handleTouchStart : undefined}
      onTouchMove={onRefresh ? handleTouchMove : undefined}
      onTouchEnd={onRefresh ? handleTouchEnd : undefined}
    >
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 w-full flex justify-center z-10 pointer-events-none"
          style={{ 
            transform: `translateY(${pullDistance}px)`,
            opacity: Math.min(pullDistance / pullThreshold, 1)
          }}
        >
          <div className="bg-slate-100 rounded-full p-2 shadow-md">
            <RefreshCw 
              className={cn(
                "h-5 w-5 text-slate-600",
                isRefreshing && "animate-spin"
              )} 
            />
          </div>
        </div>
      )}
      
      {/* Manual refresh button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          disabled={isRefreshing}
          title="Refresh messages"
        >
          <RefreshCw 
            className={cn(
              "h-4 w-4 text-slate-600",
              isRefreshing && "animate-spin"
            )} 
          />
        </button>
      </div>
      
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="p-4 space-y-0.5">
          {localMessages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              currentUserName={currentUserName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
} 