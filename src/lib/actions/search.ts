"use server";

import { db } from "@/db/db";
import { messages, users, channels } from "@/db/schema";
import { Message, User, Channel } from "@/types";
import { eq, like, ilike, and, or, desc } from "drizzle-orm";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

export type MessageWithChannel = Message & {
  channel?: Channel;
  user?: User;
};

/**
 * Search for messages within a specific channel
 */
export async function searchChannelMessages(
  channelId: string,
  query: string
): Promise<Message[]> {
  if (!query) return [];
  
  const profile = await currentProfile();
  if (!profile) redirect("/");
  
  try {
    const searchTerm = `%${query.trim()}%`;
    
    const result = await db
      .select({
        id: messages.id,
        content: messages.content,
        userId: messages.userId,
        channelId: messages.channelId,
        parentId: messages.parentId,
        isEdited: messages.isEdited,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        // Join with users table to get user information
        user: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(
        and(
          eq(messages.channelId, channelId),
          ilike(messages.content, searchTerm)
        )
      )
      .orderBy(desc(messages.createdAt));
    
    // Transform the result to match the Message type
    return result.map(item => ({
      ...item,
      user: item.user as User | undefined
    }));
  } catch (error) {
    console.error("[SEARCH_CHANNEL_MESSAGES_ERROR]", error);
    return [];
  }
}

/**
 * Search for messages across all channels the user has access to
 */
export async function searchAllMessages(query: string): Promise<MessageWithChannel[]> {
  if (!query) return [];
  
  const profile = await currentProfile();
  if (!profile) redirect("/");
  
  try {
    const searchTerm = `%${query.trim()}%`;
    
    const result = await db
      .select({
        id: messages.id,
        content: messages.content,
        userId: messages.userId,
        channelId: messages.channelId,
        parentId: messages.parentId,
        isEdited: messages.isEdited,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        // Join with users table to get user information
        user: users,
        // Join with channels table to get channel information
        channel: channels,
      })
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .leftJoin(channels, eq(messages.channelId, channels.id))
      .where(ilike(messages.content, searchTerm))
      .orderBy(desc(messages.createdAt));
    
    // Transform the result to match the Message type with channel info
    return result.map(item => ({
      ...item,
      user: item.user as User | undefined,
      channel: item.channel as Channel | undefined
    }));
  } catch (error) {
    console.error("[SEARCH_MESSAGES_ERROR]", error);
    return [];
  }
}

/**
 * Search for users by name or email
 */
export async function searchUsers(query: string): Promise<User[]> {
  if (!query) return [];
  
  const profile = await currentProfile();
  if (!profile) redirect("/");
  
  try {
    const searchTerm = `%${query.trim()}%`;
    
    const result = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.name, searchTerm),
          ilike(users.email, searchTerm)
        )
      )
      .orderBy(users.name);
    
    // Filter out the current user
    return result.filter(user => user.id !== profile.id);
  } catch (error) {
    console.error("[SEARCH_USERS_ERROR]", error);
    return [];
  }
}

/**
 * Search for channels by name or description
 */
export async function searchChannels(query: string): Promise<Channel[]> {
  if (!query) return [];
  
  const profile = await currentProfile();
  if (!profile) redirect("/");
  
  try {
    const searchTerm = `%${query.trim()}%`;
    
    const result = await db
      .select()
      .from(channels)
      .where(
        or(
          ilike(channels.name, searchTerm),
          ilike(channels.description, searchTerm)
        )
      )
      .orderBy(channels.name);
    
    return result;
  } catch (error) {
    console.error("[SEARCH_CHANNELS_ERROR]", error);
    return [];
  }
} 