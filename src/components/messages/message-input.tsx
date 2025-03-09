"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { createMessage } from "@/lib/actions/messages";
import { useMessagesState } from "@/lib/store/use-messages-state";
import { nanoid } from "nanoid";
import { Message } from "@/types";

interface MessageInputProps {
  channelId: string;
  parentId?: string;
  placeholder?: string;
}

export function MessageInput({ 
  channelId, 
  parentId,
  placeholder = "Type a message..." 
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage } = useMessagesState();
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // For demo purposes, we'll use a hardcoded user ID
      // In a real app, this would come from authentication
      const userId = "user-1"; // This should match a user ID in your database
      
      // Optimistically add the message to the UI
      const optimisticMessage = {
        id: nanoid(),
        content: content.trim(),
        userId,
        channelId: channelId,
        parentId: parentId || null,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add minimal user data for display
        user: {
          id: userId,
          name: "You", // This would be the current user's name
          email: "you@example.com",
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
      
      // Add to local state first for immediate feedback
      addMessage(channelId, optimisticMessage as any);
      
      // Clear the input
      setContent("");
      
      // Then send to the server
      await createMessage(content.trim(), userId, channelId, parentId);
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative">
      <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 resize-none focus:outline-none min-h-[60px] max-h-[200px]"
          rows={1}
          disabled={isSubmitting}
        />
        
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              type="button"
              className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              aria-label="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
} 