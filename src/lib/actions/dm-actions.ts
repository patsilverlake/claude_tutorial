'use server';

import { db } from "@/db/db";
import { channels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentProfile } from "@/lib/current-profile";
import { getUserById } from "./users";
import { getChannelMessages } from "./messages";

export async function getDMChannel(userId: string) {
  try {
    // Get current user profile
    const profile = await currentProfile();
    if (!profile) {
      throw new Error("Not authenticated");
    }

    // Get other user's profile
    const otherUser = await getUserById(userId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Construct a unique channel name for DMs using both user IDs sorted alphabetically
    const dmChannelName = `dm_${[userId, profile.id].sort().join('_')}`;
    
    // Check if channel exists
    const channelExists = await db
      .select()
      .from(channels)
      .where(eq(channels.name, dmChannelName))
      .limit(1);
    
    let dmChannel;
    if (channelExists && channelExists.length > 0) {
      dmChannel = channelExists[0];
    } else {
      // Create DM channel if it doesn't exist
      const newChannel = await db
        .insert(channels)
        .values({
          id: `dm_${Date.now().toString(36)}`,
          name: dmChannelName,
          description: `DM between ${profile.name} and ${otherUser.name}`,
        })
        .returning();
      
      dmChannel = newChannel[0];
    }

    // Fetch messages for this DM channel
    const messages = await getChannelMessages(dmChannel.id);

    // Return all needed data
    return {
      channel: dmChannel,
      messages,
      currentUser: profile,
      otherUser
    };
  } catch (error) {
    console.error("Error in getDMChannel:", error);
    throw error;
  }
} 