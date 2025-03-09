import { getCurrentUser } from '@/lib/actions/users';

export const currentProfile = async () => {
  try {
    console.log("Getting current profile...");
    // Use our getCurrentUser function instead of Supabase
    const profile = await getCurrentUser();
    console.log("Current profile:", profile);
    return profile;
  } catch (error) {
    console.error("Error getting current profile:", error);
    return null;
  }
}; 