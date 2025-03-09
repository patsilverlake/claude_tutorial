"use client";

import React, { useState } from "react";
import { MoreHorizontal, Edit, Trash, MessageSquare } from "lucide-react";
import { Message } from "@/types";
import Link from "next/link";

interface MessageActionsProps {
  message: Message;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageActions({ message, onEdit, onDelete }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
        aria-label="Message actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={handleClickOutside}
          />
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1">
            {message.channelId && (
              <Link
                href={`/channels/${message.channelId}/thread/${message.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply in Thread</span>
              </Link>
            )}
            
            {onEdit && (
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Message</span>
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-100 w-full text-left"
              >
                <Trash className="h-4 w-4" />
                <span>Delete Message</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
} 