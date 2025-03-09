import { createServerClient } from '@/lib/supabase/server';
import { db } from '@/db/db';

export const currentProfile = async () => {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Get the profile from the database using Drizzle
  const profile = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user.id)
  });
  
  return profile;
}; 