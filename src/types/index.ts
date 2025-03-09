// Type definitions for the application

// Channel type
export type Channel = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Message type
export type Message = {
  id: string;
  content: string;
  userId: string;
  channelId: string | null;
  parentId: string | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  // These fields will be populated when joining with user data
  user?: User;
};

// User type
export type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}; 