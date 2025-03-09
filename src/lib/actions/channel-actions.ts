'use server';

import { getChannelById } from "./channels";
import { getChannelMessages } from "./messages";

export async function getChannelData(channelId: string) {
  try {
    // Fetch channel data
    const channel = await getChannelById(channelId);
    if (!channel) {
      return { channel: null, messages: [] };
    }
    
    // Fetch messages
    const messages = await getChannelMessages(channelId);
    
    return {
      channel,
      messages: messages || []
    };
  } catch (error) {
    console.error("Error in getChannelData:", error);
    throw error;
  }
} 