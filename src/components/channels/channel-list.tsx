"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChannelItem } from "./channel-item";
import { Channel } from "@/types";
import { getChannels } from "@/lib/actions/channels";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateChannelButton } from "./create-channel-button";

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a fetchChannels function that can be called to refresh the channel list
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const channelData = await getChannels();
      setChannels(channelData);
      setError(null);
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError("Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  // Call fetchChannels when the component mounts
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  if (loading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 text-red-500">
        <p>{error}</p>
        <button 
          className="text-slate-400 hover:text-white text-sm mt-2"
          onClick={() => fetchChannels()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-1">
        {channels.length === 0 ? (
          <p className="px-4 py-2 text-slate-400 text-sm">No channels found</p>
        ) : (
          channels.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} />
          ))
        )}
      </div>
      <CreateChannelButton onChannelCreated={fetchChannels} />
    </div>
  );
} 