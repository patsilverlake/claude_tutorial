"use client";

import React, { useState, useEffect } from "react";
import { Message } from "@/types";
import { MessageItem } from "./message-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { containsMention } from "@/lib/utils";

interface MentionListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserName?: string; // Pass the current user's name from server component
}

export function MentionList({ 
  messages, 
  isLoading = false,
  currentUserName = ""
}: MentionListProps) {
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  
  // Filter messages that mention the current user
  useEffect(() => {
    if (currentUserName) {
      const mentionedMessages = messages.filter(message => 
        containsMention(message.content, currentUserName)
      );
      setFilteredMessages(mentionedMessages);
    }
  }, [messages, currentUserName]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 text-center text-slate-500">
          Loading mentions...
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {filteredMessages.length > 0 ? (
          <div className="py-2">
            {filteredMessages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message} 
                highlightIfMentioned={true}
                currentUserName={currentUserName}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-slate-500">
            {currentUserName ? "No mentions found" : "Loading..."}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 