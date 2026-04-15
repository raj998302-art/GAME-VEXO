import { Link } from 'react-router-dom';
import { Gamepad2, Twitter, Youtube, Instagram, Share2, Facebook, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [showShare, setShowShare] = useState(false);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = "Check out GameVexo - The Ultimate Gaming Platform!";
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShare(false);
  };

  return (
    <footer className="relative bg-bg-dark border-t border-border-color mt-auto overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary-color to-transparent opacity-50"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[50%] bg-primary-color/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-neon-pink/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-6">
              <span className="font-display font-extrabold text-[36px] tracking-[-0.05em] text-white flex items-center gap-2.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                GAME<span className="text-primary-color neon-text drop-shadow-[0_0_20px_var(--primary-glow)] animate-pulse">VEXO</span>
              </span>
            </Link>
            <p className="text-sm text-text-dim max-w-sm mb-8 leading-relaxed">
              The ultimate online gaming platform. Play thousands of free HTML5 games directly in your browser. No downloads required. Level up your gaming experience.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-card-bg border border-border-color flex items-center justify-center text-text-dim hover:text-white hover:border-primary-color hover:shadow-[0_0_15px_var(--primary-glow)] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card-bg border border-border-color flex items-center justify-center text-text-dim hover:text-white hover:border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card-bg border border-border-color flex items-center justify-center text-text-dim hover:text-white hover:border-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.5)] transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              
              <div className="relative">
                <button 
                  onClick={() => setShowShare(!showShare)}
                  className="w-10 h-10 rounded-full bg-primary-color text-white flex items-center justify-center hover:bg-primary-color/90 shadow-[0_0_15px_var(--primary-glow)] transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                {showShare && (
                  <div className="absolute bottom-full left-0 mb-2 bg-card-bg border border-border-color rounded-xl p-2 flex gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <button onClick={() => handleShare('twitter')} className="p-2 hover:bg-white/10 rounded-lg text-text-main transition-colors" title="Share on Twitter">
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare('facebook')} className="p-2 hover:bg-white/10 rounded-lg text-text-main transition-colors" title="Share on Facebook">
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare('copy')} className="p-2 hover:bg-white/10 rounded-lg text-text-main transition-colors" title="Copy Link">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6 tracking-wide uppercase">Explore</h3>
            <ul className="space-y-3 text-sm text-text-dim font-medium">
              <li><Link to="/trending" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Trending Games</Link></li>
              <li><Link to="/recent" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">New Releases</Link></li>
              <li><Link to="/categories" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">All Categories</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Leaderboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6 tracking-wide uppercase">Legal & Info</h3>
            <ul className="space-y-3 text-sm text-text-dim font-medium">
              <li><Link to="/about" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Disclaimer</Link></li>
              <li><Link to="/contact" className="hover:text-primary-color hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border-color mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-dim font-medium">
          <p>&copy; {new Date().getFullYear()} GameVexo. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
