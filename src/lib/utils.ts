import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date for display in messages
 */
export function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return format(date, "h:mm a"); // Today at 2:30 PM
  } else if (isYesterday(date)) {
    return "Yesterday at " + format(date, "h:mm a"); // Yesterday at 2:30 PM
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a"); // Mar 15, 2023 at 2:30 PM
  }
}

/**
 * Format a date as a relative time
 */
export function formatRelativeTime(date: Date): string {
  // Use a consistent format for server-side rendering to avoid hydration errors
  if (typeof window === 'undefined') {
    // On the server, use a stable representation
    return 'recently';
  }
  // On the client, use the dynamic relative time
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format message content with basic markdown-like formatting
 * This is a simple implementation and could be expanded
 */
export function formatMessageContent(content: string): string {
  // Replace URLs with anchor tags
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
  
  // Replace *text* with bold
  content = content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  
  // Replace _text_ with italic
  content = content.replace(/\_([^_]+)\_/g, '<em>$1</em>');
  
  // Replace ~text~ with strikethrough
  content = content.replace(/\~([^~]+)\~/g, '<del>$1</del>');
  
  // Replace `code` with inline code
  content = content.replace(/\`([^`]+)\`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm">$1</code>');
  
  return content;
}

/**
 * Check if a string contains a mention of a user
 */
export function containsMention(content: string, username: string): boolean {
  const mentionRegex = new RegExp(`@${username}\\b`, 'i');
  return mentionRegex.test(content);
}

/**
 * Highlight mentions in a message
 */
export function highlightMentions(content: string): string {
  // Replace @username with highlighted mention
  return content.replace(/@(\w+)/g, '<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded">@$1</span>');
}
