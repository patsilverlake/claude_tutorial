import { notFound } from "next/navigation";
import { getChannelById } from "@/lib/actions/channels";
import { searchChannelMessages } from "@/lib/actions/search";
import { ChannelSearch } from "@/components/search/channel-search";
import { MessageItem } from "@/components/messages/message-item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchPageProps {
  params: {
    channelId: string;
  };
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  const query = searchParams.q || "";
  
  // Fetch the channel
  const channel = await getChannelById(channelId);
  
  // If channel doesn't exist, show 404
  if (!channel) {
    notFound();
  }
  
  // Search for messages in the channel
  const searchResults = query ? await searchChannelMessages(channelId, query) : [];
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">#{channel.name}</h1>
          <div className="w-1/2">
            <ChannelSearch 
              channelId={channelId} 
              initialQuery={query} 
              channelName={channel.name}
            />
          </div>
        </div>
        {channel.description && (
          <p className="text-sm text-slate-500 mt-1">{channel.description}</p>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {query ? (
                  <>
                    Search results for <span className="text-blue-600">&quot;{query}&quot;</span>
                  </>
                ) : (
                  "Search for messages in this channel"
                )}
              </h2>
              <p className="text-sm text-slate-500">
                {query
                  ? `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} found`
                  : "Enter a search term above to find messages"}
              </p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No messages found matching &quot;{query}&quot;</p>
                <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 