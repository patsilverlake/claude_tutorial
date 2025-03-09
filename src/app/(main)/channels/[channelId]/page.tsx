import { notFound } from "next/navigation";
import { getChannelById } from "@/lib/actions/channels";
import { getChannelMessages } from "@/lib/actions/messages";
import { MessageList } from "@/components/messages/message-list";
import { MessageInput } from "@/components/messages/message-input";

interface ChannelPageProps {
  params: {
    channelId: string;
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  
  // Fetch the channel and messages in parallel
  const [channel, messages] = await Promise.all([
    getChannelById(channelId),
    getChannelMessages(channelId)
  ]);
  
  // If channel doesn't exist, show 404
  if (!channel) {
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
        <MessageList channelId={channelId} messages={messages} />
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