import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Moon, Sun, Gamepad2, UserCircle, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { isDarkMode, toggleDarkMode, toggleMobileMenu } = useAppStore();
  const { user, isAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-dark/90 border-b border-border-color h-[70px] backdrop-blur-[10px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 hover:bg-primary-glow rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-text-main" />
          </button>
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="https://i.ibb.co/N21dNzw7/logo.jpg" alt="GAME VEXO Logo" className="w-10 h-10 rounded-xl shadow-[0_0_15px_var(--primary-glow)]" />
            <span className="font-display font-extrabold text-[28px] tracking-[-0.05em] text-white hidden sm:flex items-center gap-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              GAME<span className="text-primary-color neon-text drop-shadow-[0_0_20px_var(--primary-glow)] animate-pulse">VEXO</span>
            </span>
          </Link>
        </div>

        <div className={`flex-1 px-4 md:block ${showMobileSearch ? 'absolute top-[70px] left-0 w-full bg-bg-dark border-b border-border-color p-4 block md:static md:bg-transparent md:border-none md:p-0 md:max-w-[400px]' : 'hidden'}`}>
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for games, categories, or creators..." 
              className="w-full bg-card-bg border border-border-color rounded-full py-2.5 px-5 text-[14px] text-text-dim focus:outline-none focus:border-primary-color transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-primary-color">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-full hover:bg-primary-glow transition-colors text-text-main relative z-50"
          >
            {showMobileSearch ? <X className="w-5 h-5 text-red-500" /> : <Search className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-primary-glow transition-colors text-text-main"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <Link to={isAdmin ? "/admin" : "/profile"} className="w-9 h-9 bg-card-bg rounded-full border border-primary-color flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-6 h-6 text-text-dim" />
              )}
            </Link>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-xl bg-primary-color text-white font-semibold text-[14px] hover:neon-glow transition-all border-none shadow-[0_0_15px_var(--primary-glow)]">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
