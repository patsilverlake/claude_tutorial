import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/db/db';

// Health check endpoint to verify API and database status
export async function GET() {
  try {
    // Check database connection
    const isDatabaseConnected = await checkDatabaseConnection();
    
    if (!isDatabaseConnected) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          services: {
            api: 'ok',
            database: 'error'
          }
        }, 
        { status: 500 }
      );
    }
    
    // If we get here, everything is working
    return NextResponse.json(
      { 
        status: 'ok', 
        message: 'All services operational',
        timestamp: new Date().toISOString(),
        services: {
          api: 'ok',
          database: 'ok'
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        services: {
          api: 'ok',
          database: 'unknown'
        }
      }, 
      { status: 500 }
    );
  }
} 