import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface GameCardProps {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  views: number;
  likes: number;
  isLive?: boolean;
  key?: string | number;
}

export default function GameCard({ id, title, slug, thumbnail, category, views, likes, isLive }: GameCardProps) {
  const { bookmarks, addBookmark, removeBookmark } = useAppStore();
  const isBookmarked = bookmarks.includes(id);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      removeBookmark(id);
    } else {
      addBookmark(id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/game/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Game link copied to clipboard!');
  };

  return (
    <div className="bg-card-bg border border-border-color rounded-[20px] overflow-hidden transition-colors duration-200 hover:border-primary-color flex flex-col group relative">
      <Link to={`/game/${slug}`} className="block h-[120px] bg-bg-dark relative overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {isLive && (
          <div className="absolute top-2.5 right-2.5 bg-[#ef4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded text-center z-10">
            LIVE
          </div>
        )}
      </Link>
      
      {/* Quick Actions overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button 
          onClick={toggleBookmark}
          className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${isBookmarked ? 'bg-primary-color text-white' : 'bg-black/50 text-white hover:bg-primary-color'}`}
          title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={handleShare}
          className="p-1.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-primary-color transition-colors"
          title="Share Game"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-[15px] relative z-10 bg-card-bg">
        <Link to={`/game/${slug}`}>
          <div className="text-[15px] font-semibold mb-1 text-text-main truncate group-hover:text-primary-color transition-colors">
            {title}
          </div>
        </Link>
        
        <div className="text-[12px] text-text-dim flex justify-between">
          <span>{category}</span>
          <span>{(views / 1000).toFixed(1)}k Plays</span>
        </div>
      </div>
    </div>
  );
}
