"use server";

import { db } from "@/db/db";
import { channels } from "@/db/schema";
import { Channel } from "@/types";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get all channels
 */
export async function getChannels(): Promise<Channel[]> {
  try {
    console.log("Fetching channels...");
    const result = await db.select().from(channels).orderBy(channels.name);
    console.log("Channels fetched successfully:", result.length);
    return result;
  } catch (error) {
    console.error("Error fetching channels:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch channels");
  }
}

/**
 * Get a channel by ID
 */
export async function getChannelById(id: string): Promise<Channel | null> {
  try {
    const result = await db.select().from(channels).where(eq(channels.id, id));
    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching channel with ID ${id}:`, error);
    throw new Error("Failed to fetch channel");
  }
}

/**
 * Create a new channel
 */
export async function createChannel(name: string, description?: string): Promise<Channel> {
  try {
    // Validate input
    if (!name || name.trim() === "") {
      throw new Error("Channel name is required");
    }
    
    // Create channel with a unique ID
    const newChannel = {
      id: nanoid(),
      name: name.trim(),
      description: description ? description.trim() : null,
    };
    
    const result = await db.insert(channels).values(newChannel).returning();
    
    // Revalidate the channels path to update the UI
    revalidatePath("/");
    
    return result[0];
  } catch (error) {
    console.error("Error creating channel:", error);
    throw new Error("Failed to create channel");
  }
}

/**
 * Update a channel
 */
export async function updateChannel(
  id: string,
  data: { name?: string; description?: string }
): Promise<Channel> {
  try {
    // Validate input
    if (data.name && data.name.trim() === "") {
      throw new Error("Channel name cannot be empty");
    }
    
    const updateData: Partial<Channel> = {};
    
    if (data.name) {
      updateData.name = data.name.trim();
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description ? data.description.trim() : null;
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    const result = await db
      .update(channels)
      .set(updateData)
      .where(eq(channels.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Channel not found");
    }
    
    // Revalidate the channels path to update the UI
    revalidatePath("/");
    revalidatePath(`/channels/${id}`);
    
    return result[0];
  } catch (error) {
    console.error(`Error updating channel with ID ${id}:`, error);
    throw new Error("Failed to update channel");
  }
}

/**
 * Delete a channel
 */
export async function deleteChannel(id: string): Promise<void> {
  try {
    const result = await db
      .delete(channels)
      .where(eq(channels.id, id))
      .returning({ id: channels.id });
    
    if (result.length === 0) {
      throw new Error("Channel not found");
    }
    
    // Revalidate the channels path to update the UI
    revalidatePath("/");
    
  } catch (error) {
    console.error(`Error deleting channel with ID ${id}:`, error);
    throw new Error("Failed to delete channel");
  }
} 