import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Maximize2, Heart, Share2, AlertCircle, Star, Play, MessageSquare, Send } from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import GameCard from '../components/GameCard';

type GameState = 'initial' | 'interstitial' | 'playing';

export default function GamePlay() {
  const { slug } = useParams<{ slug: string }>();
  const [gameState, setGameState] = useState<GameState>('initial');
  const [adCountdown, setAdCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [game, setGame] = useState<any>(null);
  const [similarGames, setSimilarGames] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addRecentlyPlayed, bookmarks, addBookmark, removeBookmark } = useAppStore();
  const { user } = useAuthStore();

  const isBookmarked = bookmarks.includes(game?.id || '');

  useEffect(() => {
    const fetchGameAndComments = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const gameData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setGame(gameData);
          addRecentlyPlayed(gameData.id);
          
          // Fetch similar games
          if (gameData.category) {
            const similarQ = query(
              gamesRef, 
              where('category', '==', gameData.category),
              where('status', '==', 'approved'),
              limit(4)
            );
            const similarSnapshot = await getDocs(similarQ);
            const similarData = similarSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(g => g.slug !== slug)
              .slice(0, 3);
            setSimilarGames(similarData);
          }

          // Fetch comments
          const commentsRef = collection(db, 'comments');
          const commentsQ = query(
            commentsRef,
            where('gameId', '==', gameData.id),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          const commentsSnapshot = await getDocs(commentsQ);
          const commentsData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setComments(commentsData);

        } else {
          setGame(null);
        }
      } catch (error) {
        console.error("Error fetching game:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameAndComments();
    setGameState('initial');
  }, [slug, addRecentlyPlayed]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'interstitial' && adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
    } else if (gameState === 'interstitial' && adCountdown === 0) {
      setGameState('playing');
    }
    return () => clearTimeout(timer);
  }, [gameState, adCountdown]);

  const handlePlayClick = () => {
    setGameState('interstitial');
    setAdCountdown(5);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleBookmark = () => {
    if (!game) return;
    if (isBookmarked) {
      removeBookmark(game.id);
    } else {
      addBookmark(game.id);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Game link copied to clipboard!');
  };

  const submitComment = async () => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
    if (!comment.trim() || !game) return;

    setIsSubmittingComment(true);
    try {
      const newComment = {
        gameId: game.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous Player',
        userPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        text: comment.trim(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'comments'), newComment);
      
      // Update local state immediately for better UX
      setComments([{ id: docRef.id, ...newComment, createdAt: { toDate: () => new Date() } }, ...comments]);
      setComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading && !game) {
    return <div className="text-center py-20 text-text-dim">Loading game details...</div>;
  }

  if (!game) {
    return <div className="text-center py-20 text-text-dim">Game not found.</div>;
  }

  return (
    <>
      <SEO 
        title={`${game.title} - Play Online`} 
        description={game.description}
        image={game.thumbnail}
        keywords={`${game.title}, play ${game.title} online, ${game.category} games, free online games, html5 games`}
        url={`https://gamevexo.com/game/${game.slug}`}
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Game Container */}
        <div 
          ref={containerRef}
          className={`relative bg-black rounded-[20px] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-border-color ${isFullscreen ? 'h-screen w-screen rounded-none border-none' : 'aspect-video'}`}
        >
          {gameState === 'initial' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <img src={game.thumbnail} alt={game.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <button 
                onClick={handlePlayClick}
                className="relative z-30 flex items-center gap-3 px-8 py-4 rounded-full bg-primary-color text-white font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_30px_var(--primary-glow)]"
              >
                <Play className="w-8 h-8 fill-current" />
                PLAY NOW
              </button>
            </div>
          )}

          {gameState === 'interstitial' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-dark z-20 p-8 text-center">
              <div className="text-text-dim text-sm uppercase tracking-widest mb-4">Advertisement</div>
              <div className="w-full max-w-md aspect-video bg-card-bg border border-dashed border-border-color rounded-xl flex items-center justify-center mb-8">
                <span className="text-text-dim">Your Ad Here</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-text-main font-medium">Game starts in {adCountdown}s</span>
                <button 
                  onClick={() => setGameState('playing')}
                  disabled={adCountdown > 0}
                  className="px-6 py-2 rounded-xl bg-card-bg border border-border-color text-text-main font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  Skip Ad
                </button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-dark z-10">
                  <div className="w-16 h-16 border-4 border-primary-color border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-primary-color font-display animate-pulse">LOADING GAME...</p>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                src={game.url}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                allow="autoplay; fullscreen; focus-without-user-activation *;"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />

              {!isFullscreen && (
                <button 
                  onClick={toggleFullscreen}
                  className="absolute bottom-4 right-4 p-3 rounded-xl bg-black/50 hover:bg-primary-color text-white backdrop-blur-sm transition-all z-20"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Game Info & Actions */}
        <div className="glass-panel p-6 rounded-[20px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-text-main">{game.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-dim">
                <span className="px-3 py-1 rounded-full bg-card-bg border border-border-color text-primary-color font-medium">
                  {game.category}
                </span>
                <span>{game.views?.toLocaleString() || 0} Views</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-text-main font-medium">{game.rating || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isBookmarked 
                    ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]' 
                    : 'bg-card-bg hover:bg-white/5 border border-border-color text-text-main'
                }`}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card-bg hover:bg-white/5 border border-border-color font-medium transition-all text-text-main"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description & Controls */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text-main">About this game</h3>
                  <p className="text-text-dim leading-relaxed">
                    {game.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-text-main">How to Play</h3>
                  <div className="p-4 rounded-xl bg-card-bg border border-border-color">
                    <p className="text-text-dim">
                      {game.controls || 'Use mouse or touch to interact.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating System */}
              <div className="border-t border-border-color pt-8">
                <h3 className="text-lg font-semibold mb-4 text-text-main">Rate this game</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        alert(`Thanks for rating ${star} stars!`);
                      }}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star 
                            ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' 
                            : 'text-text-dim'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-text-dim text-sm">
                    {rating > 0 ? `You rated ${rating} stars` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Comments System */}
              <div className="border-t border-border-color pt-8">
                <h3 className="text-lg font-semibold mb-6 text-text-main flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </h3>
                
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary-color/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-color font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={user ? "Add a public comment..." : "Please login to comment..."}
                      disabled={!user || isSubmittingComment}
                      rows={2}
                      className="w-full bg-card-bg border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main resize-none disabled:opacity-50"
                    />
                    <button 
                      onClick={submitComment}
                      disabled={!user || !comment.trim() || isSubmittingComment}
                      className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary-color text-white hover:bg-primary-color/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {comments.length > 0 ? comments.map((c) => (
                    <div key={c.id} className="flex gap-4">
                      <img src={c.userPhoto} alt={c.userName} className="w-10 h-10 rounded-full bg-card-bg object-cover" />
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-text-main">{c.userName}</span>
                          <span className="text-xs text-text-dim">
                            {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <p className="text-text-dim text-sm">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-text-dim border border-dashed border-border-color rounded-xl">
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Ad Placeholder */}
              <div className="w-full aspect-square bg-card-bg border border-dashed border-border-color rounded-[20px] flex items-center justify-center text-text-dim text-[11px] uppercase text-center p-4">
                Advertisement<br/>300x250 Style
              </div>

              {/* Similar Games */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-text-main">You may also like</h3>
                <div className="space-y-4">
                  {similarGames.map((game) => (
                    <GameCard key={game.id} {...game} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
