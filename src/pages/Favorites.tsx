import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { useAppStore } from '../store/useAppStore';

export default function Favorites() {
  const { bookmarks } = useAppStore();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteGames = async () => {
      if (bookmarks.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const gamesRef = collection(db, 'games');
        // Note: Firestore 'in' query supports up to 10 items.
        // If bookmarks has more than 10, we slice it.
        const q = query(
          gamesRef,
          where('slug', 'in', bookmarks.slice(0, 10))
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setGames(data);
      } catch (error) {
        console.error("Error fetching favorite games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteGames();
  }, [bookmarks]);

  return (
    <>
      <SEO 
        title="My Favorites" 
        description="Your favorite games saved on GameVexo."
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">My Favorites</h1>
            <p className="text-text-dim">Games you've saved for later</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-text-dim">Loading your favorite games...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-[20px] border border-border-color">
            <Bookmark className="w-16 h-16 mx-auto text-text-dim mb-4" />
            <h2 className="text-2xl font-bold text-text-main mb-2">No favorites yet</h2>
            <p className="text-text-dim">Start exploring and save some games you like!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
