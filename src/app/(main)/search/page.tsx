import React from "react";
import { searchAllMessages, searchUsers, searchChannels } from "@/lib/actions/search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hash } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  
  // If no query, show empty state
  if (!query) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-slate-200 p-4">
          <h1 className="text-xl font-semibold">Search</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <h2 className="text-lg font-semibold mb-2">Search across all channels and messages</h2>
            <p className="text-slate-500">
              Use the search box in the header or press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">⌘K</kbd> to search
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Search for messages, users, and channels in parallel
  const [messages, users, channels] = await Promise.all([
    searchAllMessages(query),
    searchUsers(query),
    searchChannels(query)
  ]);
  
  const hasResults = messages.length > 0 || users.length > 0 || channels.length > 0;
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-xl font-semibold">
          Search results for <span className="text-blue-600">"{query}"</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {messages.length + users.length + channels.length} results found
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Messages section */}
            {messages.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Messages</h2>
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-slate-200 rounded-md p-3">
                      {message.channel && (
                        <div className="mb-2">
                          <Link 
                            href={`/channels/${message.channelId}`}
                            className="text-sm font-medium text-slate-700 hover:text-blue-600"
                          >
                            #{message.channel.name}
                          </Link>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        {message.user && (
                          <Avatar className="h-8 w-8">
                            {message.user.imageUrl ? (
                              <AvatarImage src={message.user.imageUrl} alt={message.user.name} />
                            ) : (
                              <AvatarFallback>
                                {message.user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {message.user && (
                              <span className="font-medium">{message.user.name}</span>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Users section */}
            {users.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {users.map((user) => (
                    <Link 
                      key={user.id}
                      href={`/dm/${user.id}`}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50"
                    >
                      <Avatar className="h-10 w-10">
                        {user.imageUrl ? (
                          <AvatarImage src={user.imageUrl} alt={user.name} />
                        ) : (
                          <AvatarFallback>
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Channels section */}
            {channels.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Channels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channels.map((channel) => (
                    <Link 
                      key={channel.id}
                      href={`/channels/${channel.id}`}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-md hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-center h-10 w-10 bg-slate-100 rounded-md">
                        <Hash className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium">#{channel.name}</p>
                        {channel.description && (
                          <p className="text-sm text-slate-500 truncate">{channel.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* No results */}
            {!hasResults && (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-2">No results found for "{query}"</p>
                <p className="text-sm text-slate-400">Try a different search term</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 