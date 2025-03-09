import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getChannelById } from "@/lib/actions/channels";
import { getChannelMessages } from "@/lib/actions/messages";
import { MessageList } from "@/components/messages/message-list";
import { MessageInput } from "@/components/messages/message-input";
import { ChannelSearch } from "@/components/search/channel-search";
import { FullChannelSkeleton, ChannelHeaderSkeleton, MessageSkeleton } from "@/components/messages/loading-skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { revalidatePath } from "next/cache";
import { currentProfile } from "@/lib/current-profile";

interface ChannelPageProps {
  params: {
    channelId: string;
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  return (
    <Suspense fallback={<FullChannelSkeleton />}>
      <ChannelContent params={params} />
    </Suspense>
  );
}

async function ChannelContent({ params }: ChannelPageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  
  // Get current user profile
  const profile = await currentProfile();
  const currentUserName = profile?.name || "";
  
  // Fetch the channel and messages in parallel
  const [channel, messages] = await Promise.all([
    getChannelById(channelId),
    getChannelMessages(channelId)
  ]);
  
  // If channel doesn't exist, show 404
  if (!channel) {
    notFound();
  }
  
  // Function to refresh messages
  async function refreshMessages() {
    "use server";
    await getChannelMessages(channelId);
    revalidatePath(`/channels/${channelId}`);
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">#{channel.name}</h1>
            <RefreshButton 
              onRefresh={refreshMessages}
              label="Refresh"
              className="ml-2"
            />
          </div>
          <div className="w-1/3 max-w-sm">
            <ChannelSearch channelId={channelId} channelName={channel.name} />
          </div>
        </div>
        {channel.description && (
          <p className="text-sm text-slate-500 mt-1">{channel.description}</p>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<MessageSkeleton />}>
          <MessageList 
            channelId={channelId} 
            messages={messages} 
            onRefresh={refreshMessages}
            currentUserName={currentUserName}
          />
        </Suspense>
      </div>
      <div className="p-4 border-t border-slate-200">
        <MessageInput 
          channelId={channelId} 
          placeholder={`Message #${channel.name}`}
        />
      </div>
    </div>
  );
} 