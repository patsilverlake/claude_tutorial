'use client';

import { useEffect, useState } from "react";
import { getChannelById } from "@/lib/actions/channels";
import { getChannelMessages } from "@/lib/actions/messages";
import { MessageList } from "@/components/messages/message-list";
import { MessageInput } from "@/components/messages/message-input";
import { ChannelSearch } from "@/components/search/channel-search";
import { FullChannelSkeleton, MessageSkeleton } from "@/components/messages/loading-skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { notFound, useParams } from "next/navigation";
import { Channel, Message } from "@/types";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params?.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChannelData() {
      try {
        setLoading(true);
        
        // Fetch channel data
        const channelData = await getChannelById(channelId);
        if (!channelData) {
          return notFound();
        }
        setChannel(channelData);
        
        // Fetch messages
        const messagesData = await getChannelMessages(channelId);
        setMessages(messagesData || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading channel data:", err);
        setError("Failed to load channel data. Please try again.");
        setLoading(false);
      }
    }
    
    if (channelId) {
      loadChannelData();
    }
  }, [channelId]);

  // Show loading state
  if (loading) {
    return <FullChannelSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Show 404 if channel not found
  if (!channel) {
    return notFound();
  }

  // Render actual channel content
  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="font-semibold text-lg">#{channel.name}</h2>
            <p className="text-sm text-slate-500">{channel.description || "No description provided"}</p>
          </div>
        </div>
        <div>
          <ChannelSearch channelId={channelId} />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          channelId={channelId}
          messages={messages}
          onRefresh={async () => {
            try {
              const refreshedMessages = await getChannelMessages(channelId);
              setMessages(refreshedMessages || []);
            } catch (err) {
              console.error("Error refreshing messages:", err);
            }
          }}
        />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
} 