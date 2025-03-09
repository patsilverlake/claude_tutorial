// Simple toast notification implementation
import { useState } from "react";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive" | "success";
}

interface Toast extends ToastOptions {
  id: string;
}

// Global store for toasts
let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

// Notify listeners when toasts change
const notifyListeners = () => {
  listeners.forEach(listener => listener(toasts));
};

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = {
    id,
    title: options.title,
    description: options.description || "",
    duration: options.duration || 3000,
    variant: options.variant || "default",
  };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto-dismiss after duration
  setTimeout(() => {
    dismissToast(id);
  }, newToast.duration);
  
  return {
    id,
    dismiss: () => dismissToast(id),
  };
}

export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [localToasts, setLocalToasts] = useState<Toast[]>(toasts);
  
  // Subscribe to toast changes
  useState(() => {
    const listener = (updatedToasts: Toast[]) => {
      setLocalToasts([...updatedToasts]);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  });
  
  return {
    toasts: localToasts,
    toast,
    dismiss: dismissToast,
  };
} 