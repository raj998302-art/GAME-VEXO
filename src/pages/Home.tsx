import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';

const DEFAULT_HERO_SLIDES = [
  {
    id: 'default-1',
    title: 'CYBER STRIKE:\nREDLINE',
    description: 'The definitive HTML5 neon racer. Master the grid and outrun the system in the fastest browser-based experience of 2024.',
    slug: 'cyber-strike',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200&auto=format&fit=crop',
    gradient: 'from-[#1e3a8a] to-[#d946ef]',
  },
  {
    id: 'default-2',
    title: 'NEON BLASTER\nEVOLUTION',
    description: 'Intense twin-stick shooter action. Survive endless waves of geometric enemies in this retro-arcade revival.',
    slug: 'neon-blaster',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    gradient: 'from-[#0f766e] to-[#10b981]',
  },
  {
    id: 'default-3',
    title: 'SPACE DEFENDER\nORIGINS',
    description: 'Protect the galaxy from the alien armada. Upgrade your ship and unleash devastating special attacks.',
    slug: 'space-defender',
    thumbnail: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto=format&fit=crop',
    gradient: 'from-[#b91c1c] to-[#f59e0b]',
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [trendingGames, setTrendingGames] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_HERO_SLIDES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        
        // Fetch Recent Games
        const recentQuery = query(
          gamesRef, 
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recentData = recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch Trending Games (ordered by views)
        const trendingQuery = query(
          gamesRef,
          where('status', '==', 'approved'),
          orderBy('views', 'desc'),
          limit(6)
        );
        const trendingSnapshot = await getDocs(trendingQuery);
        const trendingData = trendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setRecentGames(recentData);
        setTrendingGames(trendingData);
        
        // Use top 3 trending games for hero slides, fallback to default if none
        if (trendingData.length > 0) {
          const slides = trendingData.slice(0, 3).map((game, index) => {
            const gradients = [
              'from-[#1e3a8a] to-[#d946ef]',
              'from-[#0f766e] to-[#10b981]',
              'from-[#b91c1c] to-[#f59e0b]'
            ];
            return {
              ...game,
              gradient: gradients[index % gradients.length]
            };
          });
          setHeroSlides(slides);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <>
      <SEO 
        title="Home" 
        description="Play thousands of free HTML5 games directly in your browser. No downloads required."
        keywords="online games, free games, html5 games, browser games, play games"
      />
      
      <div className="space-y-10">
        {/* Hero Section */}
        {heroSlides.length > 0 && (
          <section className="relative h-[300px] w-full rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-tr ${heroSlides[currentSlide].gradient}`}
              >
                <img 
                  src={heroSlides[currentSlide].thumbnail} 
                  alt={heroSlides[currentSlide].title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.4)] to-transparent h-full"></div>
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                  <motion.span 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block bg-[#d946ef] px-3 py-1 rounded-md text-[10px] font-extrabold uppercase mb-3 text-white w-max"
                  >
                    Featured Game
                  </motion.span>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[42px] font-black text-white mb-2.5 leading-none whitespace-pre-line"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-5 opacity-80 max-w-[400px] text-[14px] text-white line-clamp-2"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link 
                      to={`/game/${heroSlides[currentSlide].slug}`} 
                      className="inline-block bg-primary-color text-white px-[30px] py-[12px] rounded-xl font-semibold border-none shadow-[0_0_15px_var(--primary-glow)] hover:shadow-[0_0_25px_var(--primary-glow)] transition-all"
                    >
                      PLAY NOW
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-color z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-color z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="absolute bottom-5 right-10 z-20 flex gap-1.5">
              {heroSlides.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary-color shadow-[0_0_10px_var(--primary-color)] w-6' : 'bg-white/40 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Added */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-text-main">Recently Added</h2>
          </div>
          {isLoading ? (
            <div className="text-center py-10 text-text-dim">Loading games...</div>
          ) : recentGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentGames.map((game, idx) => (
                <GameCard key={game.id} {...game} isLive={idx === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
              No games available yet. Be the first to upload!
            </div>
          )}
        </section>

        {/* Trending Games */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-bold text-text-main flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Trending Now
            </h2>
          </div>
          {isLoading ? (
            <div className="text-center py-10 text-text-dim">Loading games...</div>
          ) : trendingGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendingGames.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
              No trending games yet.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
