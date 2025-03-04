import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";
import { channels } from "./channels";

// Messages table schema
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").references(() => channels.id, { onDelete: "cascade" }),
  // For parent messages (threads)
  parentId: text("parent_id"),
  isEdited: boolean("is_edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 