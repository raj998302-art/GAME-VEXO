import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Gamepad2, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';

export default function CategoryView() {
  const { slug } = useParams<{ slug: string }>();
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category';
  
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const GAMES_PER_PAGE = 8;

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const gamesRef = collection(db, 'games');
        const q = query(
          gamesRef, 
          where('status', '==', 'approved'),
          where('category', '==', categoryName),
          orderBy('createdAt', 'desc'),
          limit(GAMES_PER_PAGE)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setGames(data);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === GAMES_PER_PAGE);
      } catch (error) {
        console.error("Error fetching category games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryName) {
      fetchGames();
    }
  }, [categoryName]);

  const loadMore = async () => {
    if (!lastDoc) return;
    setIsLoadingMore(true);
    try {
      const gamesRef = collection(db, 'games');
      const q = query(
        gamesRef, 
        where('status', '==', 'approved'),
        where('category', '==', categoryName),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(GAMES_PER_PAGE)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setGames(prev => [...prev, ...data]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === GAMES_PER_PAGE);
    } catch (error) {
      console.error("Error loading more games:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <SEO 
        title={`${categoryName} Games`} 
        description={`Play the best free online ${categoryName} games on GameVexo.`}
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-color/10 text-primary-color">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">{categoryName} Games</h1>
            <p className="text-text-dim">Showing all games in {categoryName}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Loading games...</div>
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} {...game} />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-card-bg border border-border-color hover:border-primary-color text-text-main rounded-xl transition-all hover:shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary-color border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary-color" />
                  )}
                  {isLoadingMore ? 'Loading...' : 'Load More Games'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
            No games found in this category.
          </div>
        )}
      </div>
    </>
  );
}
