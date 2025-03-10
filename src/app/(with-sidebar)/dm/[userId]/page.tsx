'use client';

import { useEffect, useState } from "react";
import { DMHeader } from "@/components/dm/dm-header";
import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { FullChannelSkeleton } from "@/components/messages/loading-skeleton";
import { notFound, useParams } from "next/navigation";
import { User, Message, Channel } from "@/types";
import { AlertCircle } from "lucide-react";
import { getDMChannel } from "@/lib/actions/dm-actions";

// Define a type for our DM data
interface DMData {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  otherUser: User;
}

export default function DMPage() {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [dmData, setDMData] = useState<DMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDMData() {
      try {
        setLoading(true);
        
        // Use the server action to get DM data
        const data = await getDMChannel(userId);
        setDMData(data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading DM data:", err);
        setError("Failed to load direct message. Please try again.");
        setLoading(false);
      }
    }
    
    if (userId) {
      loadDMData();
    }
  }, [userId]);

  // Show loading state
  if (loading) {
    return <FullChannelSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-6 text-center max-w-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!dmData) {
    return notFound();
  }

  const { channel, messages, currentUser, otherUser } = dmData;

  return (
    <div className="flex flex-col h-full">
      {/* DM Header */}
      <DMHeader user={otherUser} />

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          channelId={channel.id}
          messages={messages}
          onRefresh={async () => {
            try {
              // Refresh DM data
              const refreshedData = await getDMChannel(userId);
              setDMData(refreshedData);
            } catch (err) {
              console.error("Error refreshing messages:", err);
            }
          }}
          currentUserName={currentUser.name || ""}
        />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput 
          channelId={channel.id} 
          userId={otherUser.id} 
          placeholder={`Message ${otherUser.name}`}
        />
      </div>
    </div>
  );
} 