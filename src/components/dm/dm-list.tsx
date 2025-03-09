"use client";

import React, { useEffect, useState } from "react";
import { DMItem } from "./dm-item";
import { User } from "@/types";
import { getCurrentUser, getDirectMessageUsers } from "@/lib/actions/users";
import { Skeleton } from "@/components/ui/skeleton";

export function DMList() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get the current user (for demo purposes)
        const currentUserData = await getCurrentUser();
        setCurrentUser(currentUserData);
        
        // Get all other users for DMs
        const userData = currentUserData 
          ? await getDirectMessageUsers(currentUserData.id)
          : await getDirectMessageUsers("");
          
        setUsers(userData);
        setError(null);
      } catch (err) {
        console.error("Error fetching DM users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-1">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-2 text-red-500">
        <p>{error}</p>
        <button 
          className="text-slate-400 hover:text-white text-sm mt-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {users.length === 0 ? (
        <p className="px-4 py-2 text-slate-400 text-sm">No users found</p>
      ) : (
        users.map((user) => (
          <DMItem key={user.id} user={user} />
        ))
      )}
    </div>
  );
} 