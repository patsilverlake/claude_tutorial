"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { createMessage } from "@/lib/actions/messages";
import { useUnreadState } from "@/lib/store/use-unread-state";
import { containsMention } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  channelId: string;
  parentId?: string;
  placeholder?: string;
  userId?: string; // For DMs
}

export function MessageInput({ 
  channelId, 
  parentId,
  placeholder = "Type a message...",
  userId
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { incrementChannelUnread, incrementDmUnread } = useUnreadState();
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Store the content before clearing the input
      const messageContent = content.trim();
      
      // Clear input immediately for better UX
      setContent("");
      
      // Send to server
      await createMessage(messageContent, userId || "current-user", channelId, parentId);
      
      // For channel messages
      if (channelId && !userId) {
        // Check if the message contains mentions - this is just a placeholder
        // In a real app, you'd check against all users in the channel
        const hasMention = containsMention(messageContent, "admin"); 
        
        // Increment unread count for all users except the sender
        incrementChannelUnread(channelId, hasMention);
      }

      // For DM messages
      if (userId) {
        // Increment unread count for the recipient
        incrementDmUnread(userId);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-end gap-2">
      <div className="relative flex-1 rounded-md border border-slate-200 bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none px-3 py-2 pr-16 text-sm focus:outline-none"
          style={{ maxHeight: "200px" }}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={isSubmitting}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={isSubmitting}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        size="icon"
        className="h-10 w-10 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
} 