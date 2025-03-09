"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { GlobalSearch } from "@/components/search/global-search";

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Toggle the search dialog
  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);
  
  return (
    <>
      <button
        onClick={toggleSearch}
        className="flex items-center gap-2 h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <GlobalSearch isOpen={isOpen} onClose={toggleSearch} />
    </>
  );
} 