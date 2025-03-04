"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Initial check
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Add listener for changes
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    // Clean up
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  
  return matches;
}

// Predefined breakpoints that match Tailwind's default breakpoints
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

// Hooks for common breakpoints
export function useSm() {
  return useMediaQuery(breakpoints.sm);
}

export function useMd() {
  return useMediaQuery(breakpoints.md);
}

export function useLg() {
  return useMediaQuery(breakpoints.lg);
}

export function useXl() {
  return useMediaQuery(breakpoints.xl);
}

export function use2Xl() {
  return useMediaQuery(breakpoints["2xl"]);
} 