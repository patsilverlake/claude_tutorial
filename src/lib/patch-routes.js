// This is a utility function to help extract parameters from URLs
// Can be used in both server and client components

export function extractParamsFromPath(path, pattern) {
  // Convert Next.js route pattern to regex pattern
  // e.g. /channels/[channelId] -> /channels/([^/]+)
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, '([^/]+)')
    .replace(/\//g, '\\/');
  
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  
  if (!match) return null;
  
  // Extract param names from the pattern
  const paramNames = [];
  const paramNameRegex = /\[([^\]]+)\]/g;
  let paramMatch;
  
  while ((paramMatch = paramNameRegex.exec(pattern)) !== null) {
    paramNames.push(paramMatch[1]);
  }
  
  // Create params object
  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });
  
  return params;
}

// Example usage:
// const params = extractParamsFromPath('/channels/123', '/channels/[channelId]');
// console.log(params); // { channelId: '123' } 