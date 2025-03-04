import { create } from 'zustand';

type Message = {
  id: string;
  content: string;
  userId: string;
  channelId?: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  parentId?: string;
};

type MessagesState = {
  messages: Record<string, Message[]>;
  setMessages: (channelId: string, messages: Message[]) => void;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (channelId: string, messageId: string, content: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  clearMessages: (channelId: string) => void;
};

export const useMessagesState = create<MessagesState>((set) => ({
  messages: {},
  setMessages: (channelId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: messages,
      },
    })),
  addMessage: (channelId, message) =>
    set((state) => {
      const channelMessages = state.messages[channelId] || [];
      return {
        messages: {
          ...state.messages,
          [channelId]: [...channelMessages, message],
        },
      };
    }),
  updateMessage: (channelId, messageId, content) =>
    set((state) => {
      const channelMessages = state.messages[channelId] || [];
      const updatedMessages = channelMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content,
              updatedAt: new Date(),
              isEdited: true,
            }
          : message
      );
      return {
        messages: {
          ...state.messages,
          [channelId]: updatedMessages,
        },
      };
    }),
  deleteMessage: (channelId, messageId) =>
    set((state) => {
      const channelMessages = state.messages[channelId] || [];
      const filteredMessages = channelMessages.filter(
        (message) => message.id !== messageId
      );
      return {
        messages: {
          ...state.messages,
          [channelId]: filteredMessages,
        },
      };
    }),
  clearMessages: (channelId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [],
      },
    })),
})); 