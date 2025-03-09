"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { createMessage } from "@/lib/actions/messages";
import { useUnreadState } from "@/lib/store/use-unread-state";
import { containsMention } from "@/lib/utils";

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
      // Clear input
      setContent("");
      
      // Send to server
      await createMessage(content.trim(), userId || "current-user", channelId, parentId);
      
      // For channel messages
      if (channelId && !userId) {
        // Check if the message contains mentions - this is just a placeholder
        // In a real app, you'd check against all users in the channel
        const hasMention = containsMention(content, "admin"); 
        
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
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ maxHeight: "200px" }}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
} 