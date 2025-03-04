import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
};

export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      open: () => set({ isOpen: true }),
    }),
    {
      name: 'sidebar-state',
    }
  )
); 