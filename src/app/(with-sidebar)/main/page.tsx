'use client';

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChannels } from "@/lib/actions/channels";
import Link from "next/link";
import { Channel } from "@/types";

export default function MainPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChannels() {
      try {
        // Fetch all channels
        const channelsData = await getChannels();
        setChannels(channelsData);
        setLoading(false);
      } catch (err) {
        console.error("Error in MainPage:", err);
        setError("Failed to load channels. Please try again.");
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="animate-spin h-12 w-12 border-4 border-t-blue-500 border-slate-200 rounded-full mb-4"></div>
          <p className="text-slate-600">Loading channels...</p>
        </div>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6 text-center max-w-lg">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </Container>
    );
  }

  // Display main dashboard with channels
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-3xl font-bold mb-4">Welcome to Slack Clone</h1>
        <p className="text-slate-600 mb-8 text-center max-w-2xl">
          This is a Slack clone built with Next.js, Tailwind CSS, and Supabase.
          Select a channel from the sidebar or below to start chatting.
        </p>
        
        {/* Show available channels */}
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-xl font-semibold mb-3">Available Channels</h2>
          <div className="bg-slate-100 p-4 rounded-lg">
            {channels.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {channels.map(channel => (
                  <li key={channel.id} className="py-2">
                    <Link 
                      href={`/channels/${channel.id}`}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      # {channel.name}
                      {channel.name === 'general' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          default
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No channels available</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="bg-slate-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Channels</h2>
            <p className="text-slate-600">
              Join public channels to collaborate with your team.
            </p>
          </div>
          <div className="bg-slate-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Direct Messages</h2>
            <p className="text-slate-600">
              Send private messages to specific team members.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
} 