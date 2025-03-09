import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UnreadState {
  // Map of channel IDs to unread message counts
  channelUnreads: Record<string, number>;
  // Map of user IDs to unread DM counts
  dmUnreads: Record<string, number>;
  // Map of channel IDs to whether they have mentions
  channelMentions: Record<string, boolean>;
  // Map of message IDs that have been read
  readMessages: Record<string, boolean>;
  
  // Actions
  markChannelAsRead: (channelId: string) => void;
  markDmAsRead: (userId: string) => void;
  incrementChannelUnread: (channelId: string, hasMention?: boolean) => void;
  incrementDmUnread: (userId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  isMessageRead: (messageId: string) => boolean;
  resetUnreads: () => void;
}

export const useUnreadState = create<UnreadState>()(
  persist(
    (set, get) => ({
      channelUnreads: {},
      dmUnreads: {},
      channelMentions: {},
      readMessages: {},
      
      markChannelAsRead: (channelId: string) => {
        set((state) => ({
          channelUnreads: {
            ...state.channelUnreads,
            [channelId]: 0
          },
          channelMentions: {
            ...state.channelMentions,
            [channelId]: false
          }
        }));
      },
      
      markDmAsRead: (userId: string) => {
        set((state) => ({
          dmUnreads: {
            ...state.dmUnreads,
            [userId]: 0
          }
        }));
      },
      
      incrementChannelUnread: (channelId: string, hasMention = false) => {
        set((state) => ({
          channelUnreads: {
            ...state.channelUnreads,
            [channelId]: (state.channelUnreads[channelId] || 0) + 1
          },
          channelMentions: hasMention ? {
            ...state.channelMentions,
            [channelId]: true
          } : state.channelMentions
        }));
      },
      
      incrementDmUnread: (userId: string) => {
        set((state) => ({
          dmUnreads: {
            ...state.dmUnreads,
            [userId]: (state.dmUnreads[userId] || 0) + 1
          }
        }));
      },
      
      markMessageAsRead: (messageId: string) => {
        set((state) => ({
          readMessages: {
            ...state.readMessages,
            [messageId]: true
          }
        }));
      },
      
      isMessageRead: (messageId: string) => {
        return !!get().readMessages[messageId];
      },
      
      resetUnreads: () => {
        set({
          channelUnreads: {},
          dmUnreads: {},
          channelMentions: {},
          readMessages: {}
        });
      }
    }),
    {
      name: 'unread-storage',
    }
  )
); 