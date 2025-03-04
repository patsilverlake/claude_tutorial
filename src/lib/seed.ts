import { config } from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { users, channels, messages } from "../db/schema";

async function main() {
  console.log("🌱 Seeding database...");

  // Create a PostgreSQL client
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(messages);
    await db.delete(channels);
    await db.delete(users);
    
    console.log("✅ Cleared existing data");

    // Create simulated users
    const simulatedUsers = [
      {
        id: nanoid(),
        name: "John Doe",
        email: "john@example.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: nanoid(),
        name: "Jane Smith",
        email: "jane@example.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: nanoid(),
        name: "Bob Johnson",
        email: "bob@example.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: nanoid(),
        name: "Alice Williams",
        email: "alice@example.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
      {
        id: nanoid(),
        name: "Slackbot",
        email: "slackbot@example.com",
        imageUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=slackbot",
      }
    ];

    await db.insert(users).values(simulatedUsers);
    console.log(`✅ Created ${simulatedUsers.length} simulated users`);

    // Create default channels
    const defaultChannels = [
      {
        id: nanoid(),
        name: "general",
        description: "General discussion for the team",
      },
      {
        id: nanoid(),
        name: "random",
        description: "Random stuff and off-topic conversations",
      },
      {
        id: nanoid(),
        name: "announcements",
        description: "Important announcements for the team",
      },
      {
        id: nanoid(),
        name: "help",
        description: "Get help with anything",
      }
    ];

    await db.insert(channels).values(defaultChannels);
    console.log(`✅ Created ${defaultChannels.length} default channels`);

    // Get the created users and channels for reference
    const createdUsers = await db.select().from(users);
    const createdChannels = await db.select().from(channels);

    // Create some initial messages
    const initialMessages = [
      {
        id: nanoid(),
        content: "👋 Welcome to the general channel!",
        userId: createdUsers.find(u => u.name === "Slackbot")?.id || createdUsers[0].id,
        channelId: createdChannels.find(c => c.name === "general")?.id,
      },
      {
        id: nanoid(),
        content: "This is where we'll discuss general topics.",
        userId: createdUsers.find(u => u.name === "John Doe")?.id || createdUsers[0].id,
        channelId: createdChannels.find(c => c.name === "general")?.id,
      },
      {
        id: nanoid(),
        content: "Feel free to share random thoughts here!",
        userId: createdUsers.find(u => u.name === "Jane Smith")?.id || createdUsers[1].id,
        channelId: createdChannels.find(c => c.name === "random")?.id,
      },
      {
        id: nanoid(),
        content: "Important announcements will be posted in this channel.",
        userId: createdUsers.find(u => u.name === "Bob Johnson")?.id || createdUsers[2].id,
        channelId: createdChannels.find(c => c.name === "announcements")?.id,
      },
      {
        id: nanoid(),
        content: "Need help? Ask your questions here!",
        userId: createdUsers.find(u => u.name === "Alice Williams")?.id || createdUsers[3].id,
        channelId: createdChannels.find(c => c.name === "help")?.id,
      }
    ];

    await db.insert(messages).values(initialMessages);
    console.log(`✅ Created ${initialMessages.length} initial messages`);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
    process.exit(0);
  }
}

main(); 