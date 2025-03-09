"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, MessageSquare, Users, Hash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchAllMessages, searchUsers, searchChannels, MessageWithChannel } from "@/lib/actions/search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageResults, setMessageResults] = useState<MessageWithChannel[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [channelResults, setChannelResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "messages" | "users" | "channels">("all");
  const router = useRouter();
  
  // Handle search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 2) {
        setMessageResults([]);
        setUserResults([]);
        setChannelResults([]);
        return;
      }
      
      setLoading(true);
      
      try {
        // Search based on active tab
        if (activeTab === "all" || activeTab === "messages") {
          const messages = await searchAllMessages(query);
          setMessageResults(messages);
        } else {
          setMessageResults([]);
        }
        
        if (activeTab === "all" || activeTab === "users") {
          const users = await searchUsers(query);
          setUserResults(users);
        } else {
          setUserResults([]);
        }
        
        if (activeTab === "all" || activeTab === "channels") {
          const channels = await searchChannels(query);
          setChannelResults(channels);
        } else {
          setChannelResults([]);
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape") {
        onClose();
      }
      
      // Open on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          onClose(); // This is actually opening because it toggles in the parent
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  
  // Handle navigation
  const handleSelect = (value: string) => {
    if (value.startsWith("message:")) {
      const [_, channelId, messageId] = value.split(":");
      router.push(`/channels/${channelId}?messageId=${messageId}`);
      onClose();
    } else if (value.startsWith("user:")) {
      const userId = value.split(":")[1];
      router.push(`/dm/${userId}`);
      onClose();
    } else if (value.startsWith("channel:")) {
      const channelId = value.split(":")[1];
      router.push(`/channels/${channelId}`);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <Command
          className="border-none"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <div className="flex items-center border-b p-2">
            <Search className="ml-2 h-5 w-5 text-slate-500" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              className="flex-1 border-none outline-none px-4 py-2 text-base"
              placeholder="Search messages, users, and channels..."
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mr-2 text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <div className="flex border-b mb-2">
              <Command.Group className="flex w-full">
                <Command.Item
                  value="all"
                  className={`flex-1 px-3 py-1.5 text-sm rounded-t-md ${
                    activeTab === "all" ? "bg-slate-100 text-slate-900" : "text-slate-600"
                  }`}
                >
                  All
                </Command.Item>
                <Command.Item
                  value="messages"
                  className={`flex-1 px-3 py-1.5 text-sm ${
                    activeTab === "messages" ? "bg-slate-100 text-slate-900" : "text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Messages</span>
                  </div>
                </Command.Item>
                <Command.Item
                  value="users"
                  className={`flex-1 px-3 py-1.5 text-sm ${
                    activeTab === "users" ? "bg-slate-100 text-slate-900" : "text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>Users</span>
                  </div>
                </Command.Item>
                <Command.Item
                  value="channels"
                  className={`flex-1 px-3 py-1.5 text-sm rounded-t-md ${
                    activeTab === "channels" ? "bg-slate-100 text-slate-900" : "text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Channels</span>
                  </div>
                </Command.Item>
              </Command.Group>
            </div>
            
            {loading ? (
              <div className="py-6 text-center text-slate-500">
                <p>Searching...</p>
              </div>
            ) : query.length < 2 ? (
              <div className="py-6 text-center text-slate-500">
                <p>Type at least 2 characters to search</p>
              </div>
            ) : (
              <>
                {/* Message results */}
                {(activeTab === "all" || activeTab === "messages") && messageResults.length > 0 && (
                  <Command.Group heading="Messages">
                    {messageResults.map((message) => (
                      <Command.Item
                        key={message.id}
                        value={`message:${message.channelId}:${message.id}`}
                        onSelect={handleSelect}
                        className="px-2 py-1.5 rounded-md hover:bg-slate-100"
                      >
                        <div className="flex items-start gap-2">
                          {message.user && (
                            <Avatar className="h-6 w-6 mt-0.5">
                              {message.user.imageUrl ? (
                                <AvatarImage src={message.user.imageUrl} alt={message.user.name} />
                              ) : (
                                <AvatarFallback>
                                  {message.user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span className="font-medium">{message.user?.name}</span>
                              <span>in</span>
                              <span className="font-medium">#{message.channel?.name}</span>
                              <span className="ml-1">
                                {formatRelativeTime(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm truncate">{message.content}</p>
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                
                {/* User results */}
                {(activeTab === "all" || activeTab === "users") && userResults.length > 0 && (
                  <Command.Group heading="Users">
                    {userResults.map((user) => (
                      <Command.Item
                        key={user.id}
                        value={`user:${user.id}`}
                        onSelect={handleSelect}
                        className="px-2 py-1.5 rounded-md hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {user.imageUrl ? (
                              <AvatarImage src={user.imageUrl} alt={user.name} />
                            ) : (
                              <AvatarFallback>
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                
                {/* Channel results */}
                {(activeTab === "all" || activeTab === "channels") && channelResults.length > 0 && (
                  <Command.Group heading="Channels">
                    {channelResults.map((channel) => (
                      <Command.Item
                        key={channel.id}
                        value={`channel:${channel.id}`}
                        onSelect={handleSelect}
                        className="px-2 py-1.5 rounded-md hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center h-6 w-6 bg-slate-100 rounded-md">
                            <Hash className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">#{channel.name}</p>
                            {channel.description && (
                              <p className="text-xs text-slate-500 truncate">{channel.description}</p>
                            )}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                
                {/* No results */}
                {messageResults.length === 0 && userResults.length === 0 && channelResults.length === 0 && (
                  <div className="py-6 text-center text-slate-500">
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </>
            )}
          </Command.List>
          
          <div className="border-t p-2 text-xs text-slate-500 flex justify-between">
            <div>
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↓</kbd> to navigate
            </div>
            <div>
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Enter</kbd> to select, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Esc</kbd> to close
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
} 