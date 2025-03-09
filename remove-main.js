const fs = require('fs');
const path = require('path');

// Path to the (main) directory
const mainDirPath = path.join(process.cwd(), 'src', 'app', '(main)');

// Check if directory exists
if (fs.existsSync(mainDirPath)) {
  console.log(`Found (main) directory at ${mainDirPath}, removing...`);
  
  try {
    // Remove directory and its contents recursively
    fs.rmSync(mainDirPath, { recursive: true, force: true });
    console.log('Successfully removed (main) directory');
  } catch (error) {
    console.error('Error removing (main) directory:', error);
  }
} else {
  console.log(`(main) directory not found at ${mainDirPath}`);
} 