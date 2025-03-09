import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getUserById, getCurrentUser } from "@/lib/actions/users";
import { DMHeader } from "@/components/dm/dm-header";
import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { getChannelMessages } from "@/lib/actions/messages";
import { FullChannelSkeleton, MessageSkeleton } from "@/components/messages/loading-skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { revalidatePath } from "next/cache";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/db/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AlertCircle } from "lucide-react";

interface DMPageProps {
  params: {
    userId: string;
  };
}

export default async function DMPage({ params }: DMPageProps) {
  return (
    <Suspense fallback={<FullChannelSkeleton />}>
      <DMContent params={params} />
    </Suspense>
  );
}

async function DMContent({ params }: DMPageProps) {
  console.log("Rendering DMContent with params:", params);
  
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const recipientId = resolvedParams.userId;
    
    console.log("Fetching data for DM page with recipientId:", recipientId);
    
    // Get current user and recipient in parallel
    const [profile, recipient] = await Promise.all([
      currentProfile(),
      getUserById(recipientId)
    ]);
    
    // If recipient doesn't exist, show 404
    if (!recipient) {
      console.log("Recipient not found, showing 404 for ID:", recipientId);
      notFound();
    }
    
    console.log("Recipient found:", recipient);
    
    // If profile doesn't exist, use a fallback
    const currentUser = profile || await getCurrentUser();
    if (!currentUser) {
      console.error("Could not determine current user");
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-500">Could not determine current user. Please try logging in again.</p>
        </div>
      );
    }
    
    const currentUserId = currentUser?.id || "";
    const currentUserName = currentUser?.name || "";
    
    console.log("Current user ID:", currentUserId);
    
    // For DMs, we need to use the special DM channel ID
    // Using the same convention as in createMessage
    const [smallerId, largerId] = [currentUserId, recipientId].sort();
    const dmChannelId = `dm_${smallerId}_${largerId}`;
    
    console.log("Using DM channel ID:", dmChannelId);
    
    // Check if the DM channel exists
    const dmChannel = await db
      .select()
      .from(channels)
      .where(eq(channels.id, dmChannelId))
      .limit(1);
    
    console.log("DM channel check result:", dmChannel);
    
    // Create the DM channel if it doesn't exist
    if (dmChannel.length === 0 && currentUserId) {
      console.log("Creating DM channel:", dmChannelId);
      try {
        const newChannel = {
          id: dmChannelId,
          name: `DM with ${recipient?.name || 'User'}`,
          description: `Direct messages between users`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log("Inserting new DM channel:", newChannel);
        await db.insert(channels).values(newChannel);
        
        // Verify the channel was created
        const verifyChannel = await db
          .select()
          .from(channels)
          .where(eq(channels.id, dmChannelId))
          .limit(1);
        
        if (verifyChannel.length === 0) {
          console.error("Failed to verify DM channel creation:", dmChannelId);
          throw new Error("Failed to create DM channel");
        } else {
          console.log("Created and verified DM channel:", verifyChannel[0]);
        }
      } catch (error) {
        console.error("Error creating DM channel:", error);
        // Continue anyway, we'll handle the error in the UI
      }
    }
    
    // Get messages from the DM channel
    console.log("Fetching messages for DM channel:", dmChannelId);
    const messages = await getChannelMessages(dmChannelId);
    console.log(`Found ${messages.length} messages for DM channel:`, 
      messages.length > 0 ? messages.map(m => ({ id: m.id, content: m.content.substring(0, 20) })) : "No messages");
    
    console.log("Data fetched successfully for DM page");
    
    // Function to refresh messages
    async function refreshMessages() {
      "use server";
      console.log("Refreshing messages for DM channel:", dmChannelId);
      
      try {
        // Check if the channel exists, create it if not
        const channelExists = await db
          .select()
          .from(channels)
          .where(eq(channels.id, dmChannelId))
          .limit(1);
        
        if (channelExists.length === 0) {
          console.log("DM channel doesn't exist during refresh, creating it:", dmChannelId);
          await db.insert(channels).values({
            id: dmChannelId,
            name: `DM with ${recipient?.name || 'User'}`,
            description: `Direct messages between users`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log("Created DM channel during refresh");
        }
        
        // Fetch messages
        await getChannelMessages(dmChannelId);
        
        // Revalidate the path to update the UI
        revalidatePath(`/dm/${recipientId}`);
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex-1">
            <DMHeader user={recipient} />
          </div>
          <RefreshButton 
            onRefresh={refreshMessages}
            label="Refresh"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<MessageSkeleton />}>
            <MessageList 
              channelId={dmChannelId} 
              messages={messages} 
              onRefresh={refreshMessages}
              currentUserName={currentUserName}
            />
          </Suspense>
        </div>
        <div className="p-4 border-t border-slate-200">
          <MessageInput 
            channelId={dmChannelId} 
            placeholder={`Message ${recipient.name}`}
            userId={recipientId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering DM page:", error);
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-500">Could not load the conversation. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
} 