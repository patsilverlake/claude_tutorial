"use client";

import React, { useState } from "react";
import { createChannel } from "@/lib/actions/channels";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated?: () => void;
}

export function CreateChannelDialog({ isOpen, onClose, onChannelCreated }: CreateChannelDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await createChannel(name.trim(), description.trim() || undefined);
      
      // Reset form and close dialog
      setName("");
      setDescription("");
      onClose();
      
      // Call the onChannelCreated callback if provided
      if (onChannelCreated) {
        onChannelCreated();
      }
      
    } catch (err) {
      console.error("Error creating channel:", err);
      setError("Failed to create channel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    // Reset form state when dialog closes
    setName("");
    setDescription("");
    setError(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Channels are where your team communicates. They're best when organized around a topic.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Channel name
            </label>
            <div className="flex items-center">
              <span className="mr-2 text-slate-500">#</span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. marketing"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="What's this channel about?"
              disabled={isSubmitting}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 