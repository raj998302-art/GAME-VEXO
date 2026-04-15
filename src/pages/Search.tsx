import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const gamesRef = collection(db, 'games');
        const q = query(
          gamesRef, 
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Client-side filtering for simple search
        const filteredData = data.filter(game => 
          game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setGames(filteredData);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      fetchGames();
    } else {
      setGames([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  return (
    <>
      <SEO 
        title={`Search results for "${searchQuery}"`} 
        description={`Search results for ${searchQuery} on GameVexo.`}
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-color/10 text-primary-color">
            <SearchIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">Search Results</h1>
            <p className="text-text-dim">
              {searchQuery ? `Showing results for "${searchQuery}"` : 'Enter a search term to find games'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Searching games...</div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
            No games found matching "{searchQuery}".
          </div>
        ) : null}
      </div>
    </>
  );
}
