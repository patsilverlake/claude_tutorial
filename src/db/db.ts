import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Create a Drizzle ORM instance with Vercel Postgres and schema
export const db = drizzle(sql, { schema }); 