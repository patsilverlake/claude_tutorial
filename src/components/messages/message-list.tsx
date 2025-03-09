"use client";

import React, { useEffect } from "react";
import { Message } from "@/types";
import { MessageItem } from "./message-item";
import { useMessagesState } from "@/lib/store/use-messages-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  channelId: string;
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ 
  channelId, 
  messages, 
  isLoading = false 
}: MessageListProps) {
  const { setMessages } = useMessagesState();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Update the messages in the store when they change
  useEffect(() => {
    if (messages.length > 0) {
      // Convert the messages to the format expected by the store
      const storeMessages = messages.map(msg => ({
        ...msg,
        channelId: msg.channelId || undefined,
        parentId: msg.parentId || undefined
      }));
      setMessages(channelId, storeMessages as any);
    }
  }, [channelId, messages, setMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
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
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-slate-500 max-w-md">
          Be the first to send a message in this channel!
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-0.5">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 