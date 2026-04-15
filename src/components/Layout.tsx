import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import SupportWidget from './SupportWidget';

export default function Layout() {
  const { theme, isDarkMode } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(isDarkMode ? 'dark' : 'light');
    
    // Remove all theme classes
    root.classList.remove('theme-neon', 'theme-kids', 'theme-horror', 'theme-retro');
    if (theme !== 'default') {
      root.classList.add(theme);
    }
  }, [isDarkMode, theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-[70px]">
        <Sidebar />
        <main className="flex-1 p-[30px] overflow-x-hidden">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <Footer />
      <SupportWidget />
    </div>
  );
}
