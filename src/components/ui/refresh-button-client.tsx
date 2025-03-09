"use client";

import React from "react";

export function RefreshButtonClient() {
  return (
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
    >
      Refresh Page
    </button>
  );
} 