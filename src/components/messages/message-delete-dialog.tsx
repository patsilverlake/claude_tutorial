"use client";

import React, { useState } from "react";
import { Message } from "@/types";
import { deleteMessage } from "@/lib/actions/messages";
import { useMessagesState } from "@/lib/store/use-messages-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MessageDeleteDialogProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageDeleteDialog({ message, isOpen, onClose }: MessageDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteMessage: deleteMessageFromStore } = useMessagesState();
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Optimistically remove the message from the store
      if (message.channelId) {
        deleteMessageFromStore(message.channelId, message.id);
      }
      
      // Delete the message from the database
      await deleteMessage(message.id);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error deleting message:", error);
      // Could add error handling UI here
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-slate-50 p-3 rounded-md text-sm">
            <p className="text-slate-500 mb-1 text-xs">Message content:</p>
            <p className="text-slate-700">{message.content}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 