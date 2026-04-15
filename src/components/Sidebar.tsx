import { NavLink } from 'react-router-dom';
import { Home, Flame, Clock, Bookmark, LayoutGrid, Settings, X, Bell } from 'lucide-react';
import { cn } from '../utils/helpers';
import { useAppStore } from '../store/useAppStore';
import { useState } from 'react';

export default function Sidebar() {
  const { isMobileMenuOpen, closeMobileMenu } = useAppStore();
  const [notificationStatus, setNotificationStatus] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === "granted") {
        new Notification("Notifications Enabled! 🚀", {
          body: "Welcome to GameVexo! You will now receive updates on new games and features.",
          icon: "https://api.dicebear.com/7.x/bottts/svg?seed=gamevexo"
        });
      } else if (permission === "denied") {
        alert("Notification permission was denied. You can change this in your browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-[70px] left-0 h-[calc(100vh-70px)] w-[240px] bg-bg-dark flex flex-col p-[30px] border-r border-border-color overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <span className="font-bold text-text-main">Menu</span>
          <button onClick={closeMobileMenu} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-dim" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-6">
        <div className="menu-section">
          <h4 className="text-[11px] uppercase tracking-[0.1em] text-text-dim mb-4 font-semibold">Discovery</h4>
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <Home className="w-4 h-4" /> Home
            </NavLink>
            <NavLink to="/trending" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <Flame className="w-4 h-4" /> Trending Now
            </NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> Leaderboard
            </NavLink>
            <NavLink to="/recent" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <Clock className="w-4 h-4" /> Recently Played
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <Bookmark className="w-4 h-4" /> Favorites
            </NavLink>
          </div>
        </div>

        <div className="menu-section">
          <h4 className="text-[11px] uppercase tracking-[0.1em] text-text-dim mb-4 font-semibold">Categories</h4>
          <div className="flex flex-col gap-1">
            <NavLink to="/categories" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <LayoutGrid className="w-4 h-4" /> All Categories
            </NavLink>
            {['Action Arcade', 'Battle Royale', 'Strategy HQ', 'Retro Classics', 'Sports & Racing'].map((cat) => (
              <NavLink
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 py-2.5 text-[14px] font-medium text-text-main hover:text-primary-color transition-colors decoration-transparent"
              >
                {cat}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <h4 className="text-[11px] uppercase tracking-[0.1em] text-text-dim mb-4 font-semibold">Developers</h4>
          <div className="flex flex-col gap-1">
            <NavLink to="/developer/upload" className={({ isActive }) => cn("flex items-center gap-3 py-2.5 text-[14px] font-medium transition-colors decoration-transparent", isActive ? "text-primary-color" : "text-text-main hover:text-primary-color")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Submit Game
            </NavLink>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-border-color space-y-2">
        <button
          onClick={handleEnableNotifications}
          disabled={notificationStatus === 'granted'}
          className="flex items-center justify-between py-2.5 px-3 w-full rounded-xl text-[14px] font-medium text-text-main hover:text-white hover:bg-primary-color transition-all decoration-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-main"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            {notificationStatus === 'granted' ? 'Notifications On' : 'Enable Notifications'}
          </div>
          {notificationStatus === 'granted' && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          )}
        </button>
        <NavLink
          to="/profile"
          className="flex items-center gap-3 py-2.5 px-3 w-full rounded-xl text-[14px] font-medium text-text-main hover:text-primary-color hover:bg-white/5 transition-all decoration-transparent"
        >
          <Settings className="w-4 h-4" /> Settings
        </NavLink>
      </div>
    </aside>
    </>
  );
}
