import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';
import { useAppStore } from '../store/useAppStore';

export default function Recent() {
  const { recentlyPlayed } = useAppStore();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentGames = async () => {
      if (recentlyPlayed.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const gamesRef = collection(db, 'games');
        // Note: Firestore 'in' query supports up to 10 items.
        // If recentlyPlayed has more than 10, we slice it.
        const q = query(
          gamesRef,
          where('slug', 'in', recentlyPlayed.slice(0, 10))
        );
        const snapshot = await getDocs(q);
        const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort data to match the order of recentlyPlayed
        const sortedData = data.sort((a, b) => {
          return recentlyPlayed.indexOf(a.slug) - recentlyPlayed.indexOf(b.slug);
        });
        
        setGames(sortedData);
      } catch (error) {
        console.error("Error fetching recent games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentGames();
  }, [recentlyPlayed]);

  return (
    <>
      <SEO 
        title="Recently Played" 
        description="Games you've played recently on GameVexo."
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">Recently Played</h1>
            <p className="text-text-dim">Jump back into the action</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-text-dim">Loading your recent games...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-[20px] border border-border-color">
            <Clock className="w-16 h-16 mx-auto text-text-dim mb-4" />
            <h2 className="text-2xl font-bold text-text-main mb-2">No recent games</h2>
            <p className="text-text-dim">You haven't played any games yet.</p>
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
