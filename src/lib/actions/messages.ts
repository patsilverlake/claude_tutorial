"use server";

import { db } from "@/db/db";
import { messages, users, channels } from "@/db/schema";
import { Message, User, Channel } from "@/types";
import { nanoid } from "nanoid";
import { eq, and, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

// Simple in-memory cache for channel messages
const channelMessagesCache = new Map<string, { messages: Message[], timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds in milliseconds - shorter TTL for more frequent updates

/**
 * Get messages for a channel
 */
export async function getChannelMessages(channelId: string): Promise<Message[]> {
  try {
    console.log(`Fetching messages for channel ${channelId}...`);
    
    // Check if messages are in cache and not expired
    const cachedData = channelMessagesCache.get(channelId);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
      console.log(`Using cached messages for channel ${channelId}`);
      return cachedData.messages;
    }
    
    console.log(`Cache miss or expired for channel ${channelId}, fetching from database...`);
    
    // Check if the channel exists
    const channelExists = await db
      .select()
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1);
    
    if (channelExists.length === 0) {
      console.log(`Channel ${channelId} does not exist, attempting to create if it's a DM channel`);
      
      // If it's a DM channel, try to create it
      if (channelId.startsWith('dm_')) {
        console.log(`Attempting to create DM channel ${channelId}...`);
        
        // Extract user IDs from the channel ID
        const parts = channelId.split('_');
        if (parts.length !== 3) {
          console.error(`Invalid DM channel ID format: ${channelId}`);
          return [];
        }
        
        const user1Id = parts[1];
        const user2Id = parts[2];
        
        // Get both users
        const [user1, user2] = await Promise.all([
          db.select().from(users).where(eq(users.id, user1Id)).limit(1),
          db.select().from(users).where(eq(users.id, user2Id)).limit(1)
        ]);
        
        if (user1.length === 0 || user2.length === 0) {
          console.error(`One or both users in DM channel do not exist: ${user1Id}, ${user2Id}`);
          return [];
        }
        
        // Create the DM channel
        try {
          await db.insert(channels).values({
            id: channelId,
            name: `DM between ${user1[0].name} and ${user2[0].name}`,
            description: `Direct messages between users`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          console.log(`Created DM channel ${channelId}`);
        } catch (error) {
          console.error(`Error creating DM channel ${channelId}:`, error);
          
          // Double-check if the channel was created by another concurrent request
          const checkAgain = await db
            .select()
            .from(channels)
            .where(eq(channels.id, channelId))
            .limit(1);
            
          if (checkAgain.length === 0) {
            return [];
          }
          
          // Channel exists now, continue
          console.log(`DM channel ${channelId} was created by a concurrent request`);
        }
      } else {
        return [];
      }
    }
    
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
      })
      .from(messages)
      .where(
        and(
          eq(messages.channelId, channelId),
          isNull(messages.parentId)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(50);
    
    console.log(`Found ${result.length} messages for channel ${channelId}`);
    
    // Get user info for each message
    const userIds = [...new Set(result.map((msg) => msg.userId))];
    const userResults = await Promise.all(
      userIds.map((id) => 
        db.select().from(users).where(eq(users.id, id)).limit(1)
      )
    );
    
    // Create a map of user IDs to user objects
    const userMap = new Map();
    userResults.forEach((userResult) => {
      if (userResult.length > 0) {
        userMap.set(userResult[0].id, userResult[0]);
      }
    });
    
    // Add user to each message
    const messagesWithUsers = result.map((msg) => ({
      ...msg,
      user: userMap.get(msg.userId) || null,
    }));
    
    // Store in cache
    channelMessagesCache.set(channelId, {
      messages: messagesWithUsers,
      timestamp: Date.now(),
    });
    
    return messagesWithUsers;
  } catch (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error);
    return []; // Return empty array on error rather than throwing
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
    console.log("Creating message with:", { content, userId, channelId, parentId });
    
    // Validate input
    if (!content || content.trim() === "") {
      throw new Error("Message content is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!channelId) {
      throw new Error("Channel ID is required");
    }
    
    // Check if the user exists
    const userExists = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    console.log("User exists check:", userExists);
    
    if (userExists.length === 0) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    // For DMs, we need to handle it differently
    let actualChannelId = channelId;
    let isDM = false;
    
    // If the channelId starts with 'dm_', it's a DM channel
    if (channelId.startsWith('dm_')) {
      isDM = true;
      actualChannelId = channelId;
      
      console.log("This is a DM channel:", actualChannelId);
      
      // First, get the user IDs from the DM channel ID
      const parts = actualChannelId.split('_');
      if (parts.length !== 3) {
        throw new Error(`Invalid DM channel ID format: ${actualChannelId}`);
      }
      
      const user1Id = parts[1];
      const user2Id = parts[2];
      
      // Validate that both users exist
      const [user1, user2] = await Promise.all([
        db.select().from(users).where(eq(users.id, user1Id)).limit(1),
        db.select().from(users).where(eq(users.id, user2Id)).limit(1)
      ]);
      
      if (user1.length === 0 || user2.length === 0) {
        throw new Error(`One or both users in DM channel do not exist: ${user1Id}, ${user2Id}`);
      }
      
      // Check if the DM channel exists
      const dmChannel = await db
        .select()
        .from(channels)
        .where(eq(channels.id, actualChannelId))
        .limit(1);
      
      // Create the channel if it doesn't exist
      if (dmChannel.length === 0) {
        console.log("DM channel doesn't exist, creating it...");
        
        // Create the DM channel
        const otherUser = user1Id === userId ? user2[0] : user1[0];
        
        const newChannel = {
          id: actualChannelId,
          name: `DM with ${otherUser.name}`,
          description: `Direct messages between users`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log("Creating DM channel with data:", newChannel);
        
        try {
          await db.insert(channels).values(newChannel);
          console.log("Created DM channel:", actualChannelId);
          
          // Verify the channel was created
          const verifyChannel = await db
            .select()
            .from(channels)
            .where(eq(channels.id, actualChannelId))
            .limit(1);
          
          if (verifyChannel.length === 0) {
            console.error("Failed to verify DM channel creation:", actualChannelId);
            
            // Try one more time with a slight delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const retryVerify = await db
              .select()
              .from(channels)
              .where(eq(channels.id, actualChannelId))
              .limit(1);
              
            if (retryVerify.length === 0) {
              throw new Error("Failed to create DM channel after retry");
            } else {
              console.log("Verified DM channel creation on retry:", retryVerify[0]);
            }
          } else {
            console.log("Verified DM channel creation:", verifyChannel[0]);
          }
        } catch (error) {
          console.error("Error creating DM channel:", error);
          
          // Check if another process created the channel (race condition)
          const checkAgain = await db
            .select()
            .from(channels)
            .where(eq(channels.id, actualChannelId))
            .limit(1);
            
          if (checkAgain.length === 0) {
            throw new Error(`Failed to create DM channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          
          console.log("DM channel was created by a concurrent process:", checkAgain[0]);
        }
      } else {
        console.log("DM channel already exists:", actualChannelId);
      }
    } else {
      // Check if this is a regular channel
      const channel = await db
        .select()
        .from(channels)
        .where(eq(channels.id, channelId))
        .limit(1);
      
      console.log("Channel check result:", channel);
      
      if (channel.length === 0) {
        throw new Error(`Channel with ID ${channelId} does not exist`);
      }
    }
    
    // Create message with a unique ID
    const messageId = nanoid();
    const newMessage = {
      id: messageId,
      content: content.trim(),
      userId,
      channelId: actualChannelId,
      parentId: parentId || null,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Inserting message:", newMessage);
    
    // Try to insert the message with retry logic
    let result;
    try {
      result = await db.insert(messages).values(newMessage).returning();
    } catch (error) {
      console.error("Error inserting message, trying again:", error);
      
      // Wait a moment and try again - the channel might have been created but not yet visible
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Make sure the channel exists
      const channelCheck = await db
        .select()
        .from(channels)
        .where(eq(channels.id, actualChannelId))
        .limit(1);
        
      if (channelCheck.length === 0) {
        throw new Error(`Channel ${actualChannelId} still doesn't exist after retry`);
      }
      
      // Try inserting again
      result = await db.insert(messages).values(newMessage).returning();
    }
    
    console.log("Message inserted, result:", result);

    // Get the user information
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    console.log("User info retrieved:", userInfo);

    // Revalidate the appropriate path to update the UI
    if (isDM) {
      // Extract recipient ID from the DM channel ID
      const parts = actualChannelId.split('_');
      const recipientId = parts[1] === userId ? parts[2] : parts[1];
      
      // This is a DM
      revalidatePath(`/dm/${recipientId}`);
    } else {
      // This is a regular channel message
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
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw new Error(`Failed to create message: ${error.message}`);
    }
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