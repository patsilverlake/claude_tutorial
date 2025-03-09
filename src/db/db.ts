import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL || '';

// Handle connection initialization
let client: ReturnType<typeof postgres>;
let dbInstance: ReturnType<typeof drizzle>;

// Simplified connection configuration
const CONNECTION_CONFIG = {
  max: 5,
  idle_timeout: 30,
  ssl: {
    rejectUnauthorized: false
  }
};

function initializeDatabase() {
  try {
    // Check if connection string is provided
    if (!connectionString) {
      console.error('DATABASE_URL environment variable is not set');
      return false;
    }
    
    // Create postgres client
    client = postgres(connectionString, CONNECTION_CONFIG);
    
    // Create Drizzle ORM instance
    dbInstance = drizzle(client, { schema });
    
    console.log('Database connection initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    return false;
  }
}

// Initialize the database connection
const isInitialized = initializeDatabase();

// Create proxy handler to safely handle potential connection errors
const dbProxy = new Proxy({} as typeof dbInstance, {
  get: function(target, prop) {
    // If database is not initialized, throw a clearer error
    if (!isInitialized) {
      throw new Error('Database connection failed to initialize. Check your DATABASE_URL environment variable.');
    }
    
    // Otherwise return the actual property
    return dbInstance[prop as keyof typeof dbInstance];
  }
});

// Add a health check function
async function checkDatabaseConnection(): Promise<boolean> {
  if (!isInitialized) {
    return false;
  }
  
  try {
    // Try a simple query to check connection
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Export the proxied db instance and health check
export const db = dbProxy;
export { checkDatabaseConnection }; 