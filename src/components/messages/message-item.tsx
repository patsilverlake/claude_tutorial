"use client";

import React, { useState } from "react";
import { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageDate, formatRelativeTime, formatMessageContent, highlightMentions, containsMention } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { MessageActions } from "./message-actions";
import { MessageEdit } from "./message-edit";
import { MessageDeleteDialog } from "./message-delete-dialog";
import { useUnreadState } from "@/lib/store/use-unread-state";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: Message;
  showActions?: boolean;
  highlightIfMentioned?: boolean;
  currentUserName?: string; // Pass the current user's name from server component
}

export function MessageItem({ 
  message, 
  showActions = true,
  highlightIfMentioned = true,
  currentUserName = ""
}: MessageItemProps) {
  const { user } = message;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { markMessageAsRead, isMessageRead } = useUnreadState();
  const [isRead, setIsRead] = useState(false);
  
  // Mark message as read when it's viewed
  React.useEffect(() => {
    if (message.id && !isMessageRead(message.id)) {
      markMessageAsRead(message.id);
      setIsRead(true);
    } else {
      setIsRead(isMessageRead(message.id));
    }
  }, [message.id, markMessageAsRead, isMessageRead]);
  
  if (!user) {
    return null;
  }
  
  // Check if message mentions current user
  const isMentioned = currentUserName && 
    containsMention(message.content, currentUserName);
  
  // Format the message content with basic markdown and highlight mentions
  const formattedContent = highlightMentions(formatMessageContent(message.content));
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Handle delete button click
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <div className={cn(
      "group flex items-start gap-3 py-2 px-4 hover:bg-slate-50",
      highlightIfMentioned && isMentioned && !isRead && "bg-yellow-50"
    )}>
      <Avatar className="h-9 w-9 mt-1">
        {user.imageUrl ? (
          <AvatarImage src={user.imageUrl} alt={user.name} />
        ) : (
          <AvatarFallback>
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{user.name}</span>
          <span className="text-xs text-slate-500" title={formatMessageDate(message.createdAt)}>
            {formatRelativeTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-slate-500">(edited)</span>
          )}
          {highlightIfMentioned && isMentioned && !isRead && (
            <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
              Mention
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-1">
            <MessageEdit message={message} onCancel={handleCancelEdit} />
          </div>
        ) : (
          <div className="mt-1 text-sm">
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        )}
        
        {showActions && !isEditing && (
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.channelId && (
              <Link
                href={`/channels/${message.channelId}/thread/${message.id}`}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Reply</span>
              </Link>
            )}
            
            <MessageActions 
              message={message}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <MessageDeleteDialog 
        message={message}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      />
    </div>
  );
} 