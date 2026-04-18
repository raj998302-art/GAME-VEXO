import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, SlidersHorizontal } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import GameCard from '../components/GameCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [games, setGames] = useState<any[]>([]);
  const [filteredGames, setFilteredGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let searchedData = data;
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          searchedData = data.filter(game => {
            const matchTitle = game.title?.toLowerCase().includes(searchLower);
            const matchCategory = game.category?.toLowerCase().includes(searchLower);
            const matchDescription = game.description?.toLowerCase().includes(searchLower);
            const matchTags = game.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower));
            
            return matchTitle || matchCategory || matchDescription || matchTags;
          });
        }
        
        setGames(searchedData);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [searchQuery]);

  useEffect(() => {
    let result = [...games];

    if (selectedCategory !== 'All') {
      result = result.filter(game => game.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    if (minRating > 0) {
      result = result.filter(game => (game.rating || 0) >= minRating);
    }
    
    if (sortBy === 'most_viewed') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'highest_rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

    setFilteredGames(result);
  }, [selectedCategory, minRating, sortBy, games]);

  return (
    <>
      <SEO 
        title={`Search results for "${searchQuery}"`} 
        description={`Search results for ${searchQuery} on GameVexo.`}
      />
      
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-color/10 text-primary-color">
              <SearchIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-main">Search Results</h1>
              <p className="text-text-dim">
                {searchQuery ? `Showing results for "${searchQuery}"` : 'Showing all games. Use search to refine.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
               onClick={() => setShowFilters(!showFilters)}
               className="flex items-center gap-2 px-4 py-2 bg-card-bg border border-border-color rounded-xl text-text-main hover:bg-white/5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card-bg border border-border-color p-6 rounded-[20px] grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-text-dim mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-bg-dark border border-border-color text-text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color"
              >
                <option value="All">All Categories</option>
                <option value="Action">Action</option>
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Racing">Racing</option>
                <option value="Sports">Sports</option>
                <option value="Casual">Casual</option>
                <option value="Adventure">Adventure</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-text-dim mb-2">Sort By</label>
               <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-bg-dark border border-border-color text-text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color"
              >
                <option value="relevance">Relevance</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-text-dim mb-2">Minimum Rating</label>
               <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-bg-dark border border-border-color text-text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color"
              >
                <option value="0">Any Rating</option>
                <option value="3">3 Stars & Up</option>
                <option value="4">4 Stars & Up</option>
                <option value="4.5">4.5 Stars & Up</option>
              </select>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Searching games...</div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
            No games found matching your search and filter criteria.
          </div>
        )}
      </div>
    </>
  );
}
