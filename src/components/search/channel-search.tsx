"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChannelSearchProps {
  channelId: string;
  initialQuery?: string;
  channelName?: string;
}

export function ChannelSearch({ channelId, initialQuery = "", channelName }: ChannelSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Focus the input when the component mounts if there's an initial query
  useEffect(() => {
    if (initialQuery && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      router.push(`/channels/${channelId}/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleClear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // If we're on the search page, go back to the channel
    if (window.location.pathname.includes("/search")) {
      router.push(`/channels/${channelId}`);
    }
  };
  
  return (
    <form 
      onSubmit={handleSearch}
      className={`relative flex items-center ${isFocused ? "w-full" : "w-64"} transition-all duration-200`}
    >
      <div className="relative flex-1">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Search in ${channelName ? `#${channelName}` : 'this channel'}`}
          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
} 