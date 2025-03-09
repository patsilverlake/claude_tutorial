import { notFound } from "next/navigation";
import { getChannelById } from "@/lib/actions/channels";
import { getChannelMessages } from "@/lib/actions/messages";
import { MessageThread } from "@/components/messages/message-thread";
import { getCurrentUser } from "@/lib/actions/users";

interface ThreadPageProps {
  params: {
    channelId: string;
    messageId: string;
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { channelId, messageId } = resolvedParams;
  
  // Fetch the channel, parent message, and current user in parallel
  const [channel, messages, currentUser] = await Promise.all([
    getChannelById(channelId),
    getChannelMessages(channelId),
    getCurrentUser()
  ]);
  
  // If channel doesn't exist, show 404
  if (!channel) {
    notFound();
  }
  
  // If current user doesn't exist, show 404
  if (!currentUser) {
    notFound();
  }
  
  // Find the parent message
  const parentMessage = messages.find(message => message.id === messageId);
  
  // If parent message doesn't exist, show 404
  if (!parentMessage) {
    notFound();
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-xl font-semibold">#{channel.name}</h1>
        {channel.description && (
          <p className="text-sm text-slate-500 mt-1">{channel.description}</p>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageThread 
          parentMessage={parentMessage}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
} 