import { Container } from "@/components/ui/container";
import { AlertCircle } from "lucide-react";
import { RefreshButtonClient } from "@/components/ui/refresh-button-client";
import { ChannelRedirect } from "@/components/channels/channel-redirect";
import { getChannels } from "@/lib/actions/channels";

export default async function MainPage() {
  try {
    // Fetch all channels
    const channels = await getChannels();
    
    // If channels were fetched successfully and there's at least one channel
    if (channels.length > 0) {
      // Find the general channel, or use the first channel
      const generalChannel = channels.find(channel => channel.name === "general");
      const defaultChannel = generalChannel || channels[0];
      
      // Use client component for redirect instead of server redirect
      return <ChannelRedirect channelId={defaultChannel.id} />;
    }
    
    // If no channels were found (empty array), show the placeholder UI
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <h1 className="text-3xl font-bold mb-4">Welcome to Slack Clone</h1>
          <p className="text-slate-600 mb-8 text-center max-w-2xl">
            This is a Slack clone built with Next.js, Tailwind CSS, and Supabase.
            Select a channel from the sidebar to start chatting or create a new channel.
          </p>
          
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
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in MainPage:", error);
    
    // Show an error UI
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6 text-center max-w-lg">
            We&apos;re having trouble connecting to the server. Please try refreshing the page or come back later.
          </p>
          <RefreshButtonClient />
        </div>
      </Container>
    );
  }
} 