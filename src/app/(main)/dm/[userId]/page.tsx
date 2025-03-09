import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/users";
import { DMHeader } from "@/components/dm/dm-header";
import { MessageInput } from "@/components/messages/message-input";
import { MessageList } from "@/components/messages/message-list";
import { getChannelMessages } from "@/lib/actions/messages";

interface DMPageProps {
  params: {
    userId: string;
  };
}

export default async function DMPage({ params }: DMPageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const userId = resolvedParams.userId;
  
  // Fetch the user
  const user = await getUserById(userId);
  
  // If user doesn't exist, show 404
  if (!user) {
    notFound();
  }
  
  // For demo purposes, we'll use the user ID as a channel ID for messages
  // In a real app, you would have a separate table for DM conversations
  const messages = await getChannelMessages(userId);
  
  return (
    <div className="flex flex-col h-full">
      <DMHeader user={user} />
      <div className="flex-1 overflow-hidden">
        <MessageList channelId={userId} messages={messages} />
      </div>
      <div className="p-4 border-t border-slate-200">
        <MessageInput 
          channelId={userId} 
          placeholder={`Message ${user.name}`}
        />
      </div>
    </div>
  );
} 