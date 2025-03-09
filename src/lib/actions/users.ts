"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { User } from "@/types";
import { eq, ne } from "drizzle-orm";

// Simple in-memory cache for users
const userCache = new Map<string, User>();

// Cache for current user
let currentUserCache: { user: User | null, timestamp: number } | null = null;
const CURRENT_USER_CACHE_TTL = 60000; // 1 minute in milliseconds

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  try {
    console.log("Fetching users...");
    const result = await db.select().from(users).orderBy(users.name);
    console.log("Users fetched successfully:", result.length);
    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    console.log(`Fetching user with ID ${id}...`);
    
    // Check if user is in cache
    if (userCache.has(id)) {
      console.log(`User ${id} found in cache`);
      return userCache.get(id) || null;
    }
    
    // Not in cache, fetch from database
    console.log(`User ${id} not in cache, querying database...`);
    const result = await db.select().from(users).where(eq(users.id, id));
    
    console.log(`Database query for user ${id} returned:`, result);
    
    if (result[0]) {
      // Store in cache
      userCache.set(id, result[0]);
      console.log(`User ${id} stored in cache:`, result[0]);
    } else {
      console.log(`No user found with ID ${id}`);
    }
    
    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error("Failed to fetch user");
  }
}

/**
 * Get direct message users (all users except the current user)
 * In a real app, this would filter based on the authenticated user
 * For this demo, we'll simulate by excluding a specific user ID
 */
export async function getDirectMessageUsers(currentUserId: string): Promise<User[]> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(
        // Exclude the current user
        currentUserId ? ne(users.id, currentUserId) : undefined
      )
      .orderBy(users.name);
    
    return result;
  } catch (error) {
    console.error("Error fetching direct message users:", error);
    throw new Error("Failed to fetch direct message users");
  }
}

/**
 * For demo purposes, get a simulated current user
 * In a real app, this would come from authentication
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("Fetching current user...");
    
    // Check if current user is in cache and not expired
    const now = Date.now();
    
    if (currentUserCache && (now - currentUserCache.timestamp < CURRENT_USER_CACHE_TTL)) {
      console.log("Using cached current user");
      return currentUserCache.user;
    }
    
    console.log("Cache miss or expired for current user, fetching from database...");
    
    // For demo purposes, we'll use the first user as the current user
    const result = await db.select().from(users).limit(1);
    console.log("Current user result:", result);
    
    // Store in cache
    currentUserCache = {
      user: result[0] || null,
      timestamp: now
    };
    
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to fetch current user");
  }
} 