"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { createMessage } from "@/lib/actions/messages";
import { useMessagesState } from "@/lib/store/use-messages-state";
import { nanoid } from "nanoid";
import { Message, User } from "@/types";

interface ThreadReplyProps {
  channelId: string;
  parentId: string;
  currentUser: User;
  onReplyAdded?: () => void;
}

export function ThreadReply({ 
  channelId, 
  parentId,
  currentUser,
  onReplyAdded
}: ThreadReplyProps) {
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
      
      // Create an optimistic reply
      const optimisticReply: Message = {
        id: nanoid(),
        content: content.trim(),
        userId: currentUser.id,
        channelId,
        parentId,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: currentUser
      };
      
      // Add to local state first for immediate feedback
      addMessage(channelId, optimisticReply as any);
      
      // Clear the input
      setContent("");
      
      // Then send to the server
      await createMessage(content.trim(), currentUser.id, channelId, parentId);
      
      // Notify parent component that a reply was added
      if (onReplyAdded) {
        onReplyAdded();
      }
      
    } catch (error) {
      console.error("Error sending reply:", error);
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
          placeholder="Reply in thread..."
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
            <span>Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
} 