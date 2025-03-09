"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { updateMessage } from "@/lib/actions/messages";
import { Check, X } from "lucide-react";
import { useMessagesState } from "@/lib/store/use-messages-state";

interface MessageEditProps {
  message: Message;
  onCancel: () => void;
}

export function MessageEdit({ message, onCancel }: MessageEditProps) {
  const [content, setContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateMessage: updateMessageInStore } = useMessagesState();
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);
  
  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at the end of the text
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Cancel on Escape
    else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };
  
  const handleSubmit = async () => {
    // If content is empty or unchanged, cancel
    if (!content.trim() || content === message.content || isSubmitting) {
      onCancel();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Optimistically update the message in the store
      if (message.channelId) {
        updateMessageInStore(message.channelId, message.id, content);
      }
      
      // Update the message in the database
      await updateMessage(message.id, content);
      
      // Close the edit mode
      onCancel();
    } catch (error) {
      console.error("Error updating message:", error);
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
          className="w-full px-4 py-3 resize-none focus:outline-none min-h-[60px] max-h-[200px]"
          rows={1}
          disabled={isSubmitting}
          placeholder="Edit your message..."
        />
        
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-100 rounded">Esc</kbd> to cancel, </span>
            <span><kbd className="px-1 py-0.5 bg-slate-100 rounded">Enter</kbd> to save</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
              aria-label="Cancel"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || content === message.content || isSubmitting}
              className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 