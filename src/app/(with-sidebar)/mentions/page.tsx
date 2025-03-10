import React from "react";
import { getAllMessages } from "@/lib/actions/messages";
import { MentionList } from "@/components/messages/mention-list";
import { currentProfile } from "@/lib/current-profile";

export default async function MentionsPage() {
  // Fetch all messages and current user in parallel
  const [messages, profile] = await Promise.all([
    getAllMessages(),
    currentProfile()
  ]);
  
  // Get the current user's name
  const currentUserName = profile?.name || "";
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-xl font-semibold">Mentions</h1>
        <p className="text-sm text-slate-500">
          Messages where you were mentioned
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <MentionList 
          messages={messages} 
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
} 