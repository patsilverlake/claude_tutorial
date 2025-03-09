"use client";

import React, { useEffect, useState } from "react";
import { Message, User } from "@/types";
import { MessageItem } from "./message-item";
import { ThreadReply } from "./thread-reply";
import { getThreadReplies } from "@/lib/actions/messages";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageThreadProps {
  parentMessage: Message;
  currentUser: User;
}

export function MessageThread({ parentMessage, currentUser }: MessageThreadProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const fetchReplies = async () => {
    try {
      setLoading(true);
      const replyData = await getThreadReplies(parentMessage.id);
      setReplies(replyData);
      setError(null);
    } catch (err) {
      console.error("Error fetching thread replies:", err);
      setError("Failed to load replies");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch replies when the component mounts or when the parent message changes
  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);
  
  // Scroll to bottom when replies change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replies]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold mb-2">Thread</h2>
        <MessageItem message={parentMessage} showActions={false} />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-0.5">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                className="text-blue-500 hover:underline"
                onClick={fetchReplies}
              >
                Try again
              </button>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No replies yet</p>
              <p className="text-sm mt-1">Be the first to reply to this thread</p>
            </div>
          ) : (
            replies.map((reply) => (
              <MessageItem key={reply.id} message={reply} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-200">
        <ThreadReply 
          channelId={parentMessage.channelId || ""}
          parentId={parentMessage.id}
          currentUser={currentUser}
          onReplyAdded={fetchReplies}
        />
      </div>
    </div>
  );
} 