import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'default' | 'theme-neon' | 'theme-kids' | 'theme-horror' | 'theme-retro';

interface AppState {
  theme: Theme;
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  bookmarks: string[];
  addBookmark: (gameId: string) => void;
  removeBookmark: (gameId: string) => void;
  recentlyPlayed: string[];
  addRecentlyPlayed: (gameId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'default',
      isDarkMode: true,
      isMobileMenuOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      bookmarks: [],
      addBookmark: (gameId) => set((state) => ({ 
        bookmarks: [...new Set([...state.bookmarks, gameId])] 
      })),
      removeBookmark: (gameId) => set((state) => ({ 
        bookmarks: state.bookmarks.filter(id => id !== gameId) 
      })),
      recentlyPlayed: [],
      addRecentlyPlayed: (gameId) => set((state) => {
        const filtered = state.recentlyPlayed.filter(id => id !== gameId);
        return { recentlyPlayed: [gameId, ...filtered].slice(0, 10) };
      }),
    }),
    {
      name: 'gaming-platform-storage',
    }
  )
);
