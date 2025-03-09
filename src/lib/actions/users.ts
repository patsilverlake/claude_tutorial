"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { User } from "@/types";
import { eq, ne } from "drizzle-orm";

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
    const result = await db.select().from(users).where(eq(users.id, id));
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
    // For demo purposes, we'll use the first user as the current user
    const result = await db.select().from(users).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch current user");
  }
} 