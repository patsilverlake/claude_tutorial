import React from "react";
import { Container } from "@/components/ui/container";

export default function MainPage() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-3xl font-bold mb-4">Welcome to Slack Clone</h1>
        <p className="text-slate-600 mb-8 text-center max-w-2xl">
          This is a Slack clone built with Next.js, Tailwind CSS, and Supabase.
          Select a channel from the sidebar to start chatting.
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
} 