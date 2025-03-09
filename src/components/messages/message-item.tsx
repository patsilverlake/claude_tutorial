"use client";

import React, { useState } from "react";
import { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageDate, formatRelativeTime, formatMessageContent } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { MessageActions } from "./message-actions";
import { MessageEdit } from "./message-edit";
import { MessageDeleteDialog } from "./message-delete-dialog";

interface MessageItemProps {
  message: Message;
  showActions?: boolean;
}

export function MessageItem({ message, showActions = true }: MessageItemProps) {
  const { user } = message;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (!user) {
    return null;
  }
  
  // Format the message content with basic markdown
  const formattedContent = formatMessageContent(message.content);
  
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
    <div className="group flex items-start gap-3 py-2 px-4 hover:bg-slate-50">
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