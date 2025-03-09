"use server";

import { db } from "@/db/db";
import { messages, users, channels } from "@/db/schema";
import { Message, User, Channel } from "@/types";
import { nanoid } from "nanoid";
import { eq, and, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

/**
 * Get messages for a channel
 */
export async function getChannelMessages(channelId: string): Promise<Message[]> {
  try {
    // Get messages for the channel that are not replies (parentId is null)
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
          isNull(messages.parentId)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Transform the result to match the Message type
    return result.map(item => ({
      ...item,
      user: item.user as User | undefined
    }));
  } catch (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error);
    throw new Error("Failed to fetch messages");
  }
}

/**
 * Get thread replies for a parent message
 */
export async function getThreadReplies(parentId: string): Promise<Message[]> {
  try {
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
      .where(eq(messages.parentId, parentId))
      .orderBy(messages.createdAt);

    // Transform the result to match the Message type
    return result.map(item => ({
      ...item,
      user: item.user as User | undefined
    }));
  } catch (error) {
    console.error(`Error fetching replies for message ${parentId}:`, error);
    throw new Error("Failed to fetch replies");
  }
}

/**
 * Create a new message
 */
export async function createMessage(
  content: string,
  userId: string,
  channelId: string,
  parentId?: string
): Promise<Message> {
  try {
    // Validate input
    if (!content || content.trim() === "") {
      throw new Error("Message content is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!channelId && !parentId) {
      throw new Error("Either channel ID or parent message ID is required");
    }

    // Create message with a unique ID
    const newMessage = {
      id: nanoid(),
      content: content.trim(),
      userId,
      channelId,
      parentId: parentId || null,
      isEdited: false,
    };

    const result = await db.insert(messages).values(newMessage).returning();

    // Get the user information
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Revalidate the channel path to update the UI
    if (channelId) {
      revalidatePath(`/channels/${channelId}`);
    }

    if (parentId) {
      revalidatePath(`/channels/${channelId}/thread/${parentId}`);
    }

    // Return the message with user information
    return {
      ...result[0],
      user: userInfo[0],
    };
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to create message");
  }
}

/**
 * Update a message
 */
export async function updateMessage(
  id: string,
  content: string
): Promise<Message> {
  try {
    // Validate input
    if (!content || content.trim() === "") {
      throw new Error("Message content is required");
    }

    // Get the message to update
    const messageToUpdate = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (messageToUpdate.length === 0) {
      throw new Error("Message not found");
    }

    // Update the message
    const result = await db
      .update(messages)
      .set({
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, id))
      .returning();

    // Get the user information
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, result[0].userId))
      .limit(1);

    // Revalidate the channel path to update the UI
    if (result[0].channelId) {
      revalidatePath(`/channels/${result[0].channelId}`);
    }

    if (result[0].parentId) {
      revalidatePath(`/channels/${result[0].channelId}/thread/${result[0].parentId}`);
    }

    // Return the updated message with user information
    return {
      ...result[0],
      user: userInfo[0],
    };
  } catch (error) {
    console.error(`Error updating message with ID ${id}:`, error);
    throw new Error("Failed to update message");
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<void> {
  try {
    // Get the message to delete
    const messageToDelete = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    if (messageToDelete.length === 0) {
      throw new Error("Message not found");
    }

    // Delete the message
    await db.delete(messages).where(eq(messages.id, id));

    // Revalidate the channel path to update the UI
    if (messageToDelete[0].channelId) {
      revalidatePath(`/channels/${messageToDelete[0].channelId}`);
    }

    if (messageToDelete[0].parentId) {
      revalidatePath(`/channels/${messageToDelete[0].channelId}/thread/${messageToDelete[0].parentId}`);
    }
  } catch (error) {
    console.error(`Error deleting message with ID ${id}:`, error);
    throw new Error("Failed to delete message");
  }
}

/**
 * Get all messages across all channels
 */
export async function getAllMessages(): Promise<Message[]> {
  const profile = await currentProfile();
  if (!profile) redirect("/");
  
  try {
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
      .orderBy(desc(messages.createdAt));
    
    // Transform the result to match the Message type
    return result.map(item => ({
      ...item,
      user: item.user as User | undefined,
      channel: item.channel as Channel | undefined
    }));
  } catch (error) {
    console.error("[GET_ALL_MESSAGES_ERROR]", error);
    return [];
  }
} 