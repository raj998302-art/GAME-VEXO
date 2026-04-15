import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';

export default function Trending() {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        const q = query(
          gamesRef,
          where('status', '==', 'approved'),
          orderBy('views', 'desc'),
          limit(16)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGames(data);
      } catch (error) {
        console.error("Error fetching trending games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingGames();
  }, []);

  return (
    <>
      <SEO 
        title="Trending Games" 
        description="Play the most popular and trending games right now on GameVexo."
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">Trending Now</h1>
            <p className="text-text-dim">The hottest games everyone is playing</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Loading trending games...</div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div key={game.id} className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary-color text-white flex items-center justify-center font-bold z-10 shadow-[0_0_10px_var(--primary-glow)]">
                  {index + 1}
                </div>
                <GameCard {...game} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
            No trending games available right now.
          </div>
        )}
      </div>
    </>
  );
}
