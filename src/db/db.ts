import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a postgres client with SSL verification disabled for development
// In production, you would want to use proper SSL certificates
const client = postgres(connectionString, { 
  max: 1,
  ssl: {
    rejectUnauthorized: false // This allows self-signed certificates
  },
  idle_timeout: 20
});

// Create a Drizzle ORM instance with postgres.js and schema
export const db = drizzle(client, { schema }); 