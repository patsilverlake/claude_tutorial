'use client';

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/actions/users";
import { DMHeader } from "@/components/dm/dm-header";
import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { getChannelMessages } from "@/lib/actions/messages";
import { FullChannelSkeleton, MessageSkeleton } from "@/components/messages/loading-skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { notFound, useParams } from "next/navigation";
import { User, Message } from "@/types";
import { AlertCircle } from "lucide-react";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/db/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";

export default function DMPage() {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [dmChannelId, setDmChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadDMData() {
      try {
        setLoading(true);
        
        // Get the other user's profile
        const otherUser = await getUserById(userId);
        if (!otherUser) {
          return notFound();
        }
        setUser(otherUser);
        
        // Get current user
        const profile = await currentProfile();
        if (!profile) {
          setError("You must be logged in to view direct messages");
          setLoading(false);
          return;
        }
        setCurrentUser(profile);
        
        // Find or create DM channel 
        // Construct a unique channel name for DMs using both user IDs sorted alphabetically
        const dmChannelName = `dm_${[userId, profile.id].sort().join('_')}`;
        
        // Check if channel exists
        let channelExists;
        try {
          channelExists = await db
            .select()
            .from(channels)
            .where(eq(channels.name, dmChannelName))
            .limit(1);
        } catch (err) {
          console.error("Error checking for DM channel:", err);
          setError("Failed to load DM channel. Please try again.");
          setLoading(false);
          return;
        }
        
        let dmChannel;
        if (channelExists && channelExists.length > 0) {
          dmChannel = channelExists[0];
        } else {
          // Create DM channel if it doesn't exist
          try {
            const newChannel = await db
              .insert(channels)
              .values({
                id: `dm_${Date.now().toString(36)}`,
                name: dmChannelName,
                description: `DM between ${profile.name} and ${otherUser.name}`,
              })
              .returning();
            
            dmChannel = newChannel[0];
          } catch (err) {
            console.error("Error creating DM channel:", err);
            setError("Failed to create DM channel. Please try again.");
            setLoading(false);
            return;
          }
        }
        
        setDmChannelId(dmChannel.id);
        
        // Fetch messages for this DM channel
        const messagesData = await getChannelMessages(dmChannel.id);
        setMessages(messagesData || []);
        
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

  if (!user || !currentUser || !dmChannelId) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full">
      {/* DM Header */}
      <DMHeader user={user} />

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          channelId={dmChannelId}
          messages={messages}
          onRefresh={async () => {
            if (dmChannelId) {
              try {
                const refreshedMessages = await getChannelMessages(dmChannelId);
                setMessages(refreshedMessages || []);
              } catch (err) {
                console.error("Error refreshing messages:", err);
              }
            }
          }}
          currentUserName={currentUser.name || ""}
        />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput 
          channelId={dmChannelId} 
          userId={user.id} 
          placeholder={`Message ${user.name}`}
        />
      </div>
    </div>
  );
} 