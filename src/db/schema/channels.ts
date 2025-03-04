import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Channels table schema
export const channels = pgTable("channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 