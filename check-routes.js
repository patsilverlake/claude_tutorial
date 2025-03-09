const fs = require('fs');
const path = require('path');

function listDynamicRoutes(dir = 'src/app', level = 0) {
  console.log('--- Checking Routes ---');

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip hidden files and node_modules
      if (item.name.startsWith('.') || item.name === 'node_modules') {
        continue;
      }
      
      if (item.isDirectory()) {
        const isDynamicRoute = item.name.startsWith('[') && item.name.endsWith(']');
        const isRouteGroup = item.name.startsWith('(') && item.name.endsWith(')');
        
        if (isDynamicRoute) {
          console.log(`${' '.repeat(level * 2)}📁 [Dynamic Route] ${fullPath}`);
        } else if (isRouteGroup) {
          console.log(`${' '.repeat(level * 2)}📁 [Route Group] ${fullPath}`);
        } else {
          console.log(`${' '.repeat(level * 2)}📁 ${fullPath}`);
        }
        
        // Recursively check subdirectories
        listDynamicRoutes(fullPath, level + 1);
      } else if (item.name === 'page.tsx' || item.name === 'page.js') {
        console.log(`${' '.repeat(level * 2)}📄 [Page] ${fullPath}`);
      }
    }
  } catch (error) {
    console.error(`Error checking routes: ${error.message}`);
  }

  if (level === 0) {
    console.log('--- End of Routes ---');
  }
}

// Run the function to list all routes
listDynamicRoutes(); 