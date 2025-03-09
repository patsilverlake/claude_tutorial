"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChannelItem } from "./channel-item";
import { Channel } from "@/types";
import { getChannels } from "@/lib/actions/channels";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateChannelButton } from "./create-channel-button";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Create a fetchChannels function that can be called to refresh the channel list
  const fetchChannels = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
      } else {
        setLoading(true);
      }

      // Fetch channels with a timeout to prevent infinite loading
      const timeoutPromise = new Promise<Channel[]>((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 5000)
      );
      
      const fetchPromise = getChannels();
      const channelData = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (channelData.length === 0 && !isRetry) {
        // If no channels and not a retry, check cached channels first
        const cachedChannels = localStorage.getItem('cachedChannels');
        if (cachedChannels) {
          try {
            const parsed = JSON.parse(cachedChannels);
            setChannels(parsed);
            console.log("Using cached channels data");
            // Set a soft error that doesn't block UI
            setError("Using cached data. Live connection unavailable.");
            setLoading(false);
            setIsRetrying(false);
            return;
          } catch (e) {
            console.error("Failed to parse cached channels:", e);
          }
        }
      }
      
      setChannels(channelData);
      setError(null);
    } catch (err) {
      console.error("Error fetching channels:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to load channels";
      
      setError(errorMessage);
      
      // Try to use cached data as fallback
      if (channels.length === 0) {
        const cachedChannels = localStorage.getItem('cachedChannels');
        if (cachedChannels) {
          try {
            const parsed = JSON.parse(cachedChannels);
            setChannels(parsed);
            console.log("Using cached channels data after error");
            // Indicate we're using cached data
            setError("Using cached data. Connection error: " + errorMessage);
          } catch (e) {
            console.error("Failed to parse cached channels:", e);
          }
        }
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, [channels.length]);

  // Call fetchChannels when the component mounts
  useEffect(() => {
    fetchChannels();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      // Only auto-refresh if there's no error
      if (!error) {
        fetchChannels();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchChannels, error]);
  
  // Cache the channels data when we have it
  useEffect(() => {
    if (channels.length > 0) {
      localStorage.setItem('cachedChannels', JSON.stringify(channels));
    }
  }, [channels]);

  const handleRetry = () => {
    fetchChannels(true);
  };

  if (loading && !isRetrying) {
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
      <div className="px-4 py-3 bg-red-50 rounded-md mb-2">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading channels</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <button 
              className="mt-2 flex items-center text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry {retryCount > 0 ? `(${retryCount})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[2px]">
      {channels.map((channel) => (
        <ChannelItem key={channel.id} channel={channel} />
      ))}
      <div className="pt-2">
        <CreateChannelButton onChannelCreated={() => fetchChannels()} />
      </div>
    </div>
  );
} 