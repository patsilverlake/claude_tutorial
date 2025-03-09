"use client";

import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateChannelDialog } from "./create-channel-dialog";

interface CreateChannelButtonProps {
  onChannelCreated?: () => void;
}

export function CreateChannelButton({ onChannelCreated }: CreateChannelButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  
  return (
    <>
      <button 
        onClick={openDialog}
        className="flex items-center gap-2 px-4 py-2 mt-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        <span>Add Channel</span>
      </button>
      
      <CreateChannelDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog}
        onChannelCreated={onChannelCreated}
      />
    </>
  );
} 