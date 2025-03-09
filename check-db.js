// Simple script to check the database
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDatabase() {
  const client = await pool.connect();
  try {
    console.log('Checking users table...');
    const usersResult = await client.query('SELECT * FROM users');
    console.log(`Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      console.log(`- ${user.id}: ${user.name} (${user.email})`);
    });

    console.log('\nChecking channels table...');
    const channelsResult = await client.query('SELECT * FROM channels');
    console.log(`Found ${channelsResult.rows.length} channels:`);
    channelsResult.rows.forEach(channel => {
      console.log(`- ${channel.id}: ${channel.name}`);
    });

    // Check for Alice specifically
    console.log('\nLooking for Alice...');
    const aliceResult = await client.query("SELECT * FROM users WHERE name LIKE '%Alice%'");
    if (aliceResult.rows.length > 0) {
      console.log('Found Alice:', aliceResult.rows[0]);
    } else {
      console.log('Alice not found in the database');
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    client.release();
    pool.end();
  }
}

checkDatabase(); 