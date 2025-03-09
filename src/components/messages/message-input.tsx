"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, AlertCircle, Loader2 } from "lucide-react";
import { createMessage } from "@/lib/actions/messages";
import { useUnreadState } from "@/lib/store/use-unread-state";
import { containsMention } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/users";
import { useMessagesState } from "@/lib/store/use-messages-state";
import { toast } from "@/components/ui/use-toast";

interface MessageInputProps {
  channelId: string;
  parentId?: string;
  placeholder?: string;
  userId?: string; // For DMs - this is the recipient's user ID
}

export function MessageInput({ 
  channelId, 
  parentId,
  placeholder = "Type a message...",
  userId
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { incrementChannelUnread, incrementDmUnread } = useUnreadState();
  const { addMessage, deleteMessage } = useMessagesState();
  
  // Get the current user ID and profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("Fetching current user in MessageInput...");
        setError(null);
        const user = await getCurrentUser();
        console.log("Current user fetched:", user);
        if (user) {
          setCurrentUserId(user.id);
          setCurrentUserProfile(user);
          console.log("Set current user ID to:", user.id);
        } else {
          console.error("No current user found");
          setError("Could not determine current user. Please refresh the page.");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError("Failed to fetch user information. Please refresh the page.");
      }
    };
    
    fetchCurrentUser();
  }, []);
  
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
    if (!content.trim() || isSubmitting || !currentUserId) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Store the content before clearing the input
      const messageContent = content.trim();
      
      // Clear input immediately for better UX
      setContent("");
      
      console.log("Sending message:", {
        content: messageContent,
        currentUserId,
        channelId,
        userId,
        parentId
      });
      
      // Create a temporary message ID with a unique prefix
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a temporary message to show immediately
      const tempMessage = {
        id: tempId,
        content: messageContent,
        userId: currentUserId,
        channelId: channelId,
        parentId: parentId || undefined,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: currentUserProfile || {
          id: currentUserId,
          name: "You", // This will be replaced when the real message is fetched
          email: "",
          imageUrl: currentUserProfile?.imageUrl || "",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      // Add the temporary message to the UI
      addMessage(channelId, tempMessage);
      
      // Send to server
      let result;
      try {
        if (userId) {
          // This is a DM - use the DM channel ID (which is now a special channel for DMs)
          console.log("Sending DM to user:", userId, "using channel:", channelId);
          
          // Make sure we're using the correct channel ID format for DMs
          if (!channelId.startsWith('dm_')) {
            console.error("Invalid DM channel ID format:", channelId);
            throw new Error("Invalid DM channel ID format");
          }
          
          result = await createMessage(messageContent, currentUserId, channelId, parentId);
          
          // Increment unread count for the recipient
          incrementDmUnread(userId);
        } else {
          // This is a regular channel message
          console.log("Sending channel message to:", channelId);
          result = await createMessage(messageContent, currentUserId, channelId, parentId);
          
          // Check if the message contains mentions
          const hasMention = containsMention(messageContent, "admin"); 
          
          // Increment unread count for all users except the sender
          incrementChannelUnread(channelId, hasMention);
        }
        
        console.log("Message created successfully:", result);
        toast({
          description: "Message sent successfully",
          duration: 2000,
        });
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Remove the temporary message
        deleteMessage(channelId, tempId);
        
        // Show error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to send message: ${errorMessage}`);
        
        toast({
          variant: "destructive",
          title: "Failed to send message",
          description: "Please try again",
          duration: 3000,
        });
        
        // Restore the message content for retry
        setContent(messageContent);
        return;
      }
      
    } catch (error) {
      console.error("Error in message handling:", error);
      setError("An unexpected error occurred. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md flex items-center text-sm mb-2">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
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
            disabled={isSubmitting || !currentUserId}
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
          disabled={!content.trim() || isSubmitting || !currentUserId}
          size="icon"
          className="h-10 w-10 rounded-full"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
} 