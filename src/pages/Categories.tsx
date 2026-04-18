import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';

function LiveCategoryCard({ cat, thumbnails }: { key?: string | number, cat: any, thumbnails: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!thumbnails || thumbnails.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thumbnails.length);
    }, 3000 + Math.random() * 2000); // randomize interval slightly so they don't all switch at once
    
    return () => clearInterval(interval);
  }, [thumbnails]);

  const currentImage = thumbnails?.length > 0 ? thumbnails[currentIndex] : (cat.image || 'https://i.ibb.co/N21dNzw7/logo.jpg');

  return (
    <Link 
      to={`/category/${cat.name.toLowerCase()}`}
      className="group relative rounded-[20px] overflow-hidden aspect-[4/3] glass-panel border border-border-color hover:border-primary-color transition-colors duration-200"
    >
      <img 
        key={currentImage} // key forces re-render if we want CSS animation, but straightforward src change is smoother
        src={currentImage} 
        alt={cat.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" 
        style={thumbnails?.length > 1 ? { animation: 'fadeIn 0.5s ease-in-out' } : {}}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.4)] to-transparent flex flex-col justify-end p-6">
        <h3 className="text-[20px] font-bold text-text-main mb-1 group-hover:text-primary-color transition-colors">
          {cat.name}
        </h3>
        <p className="text-text-dim text-[12px]">
          {cat.description || 'Explore games'}
        </p>
      </div>
    </Link>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryThumbnails, setCategoryThumbnails] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndGames = async () => {
      try {
        // Fetch categories
        const categoriesRef = collection(db, 'categories');
        let fetchedCategories: any[] = [];
        try {
          const snapshot = await getDocs(categoriesRef);
          if (!snapshot.empty) {
            fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
        } catch (e) {
          console.error("Error fetching categories collection:", e);
        }

        const defaultCategories = [
          { id: '1', name: 'Action', description: 'Action packed games', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '2', name: 'Arcade', description: 'Classic arcade games', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '3', name: 'Puzzle', description: 'Brain teasing puzzles', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '4', name: 'Racing', description: 'High speed racing', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '5', name: 'Sports', description: 'Competitive sports', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '6', name: 'Casual', description: 'Relaxing casual games', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '7', name: 'Adventure', description: 'Epic adventures', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' },
          { id: '8', name: 'Strategy', description: 'Tactical strategy games', image: 'https://i.ibb.co/N21dNzw7/logo.jpg' }
        ];

        const finalCategories = fetchedCategories.length > 0 ? fetchedCategories : defaultCategories;
        setCategories(finalCategories);

        // Fetch games to get dynamic thumbnails for categories
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('status', '==', 'approved'));
        const gamesSnapshot = await getDocs(q);
        
        const thumbnailsMap: Record<string, string[]> = {};
        gamesSnapshot.docs.forEach((doc) => {
          const game = doc.data();
          if (game.category && game.thumbnail) {
            const catName = game.category.toLowerCase();
            if (!thumbnailsMap[catName]) thumbnailsMap[catName] = [];
            if (thumbnailsMap[catName].length < 8) { // Keep up to 8 images to cycle through
              thumbnailsMap[catName].push(game.thumbnail);
            }
          }
        });
        
        setCategoryThumbnails(thumbnailsMap);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndGames();
  }, []);

  return (
    <>
      <SEO 
        title="Categories" 
        description="Browse games by category. Find your favorite action, puzzle, racing, and arcade games."
      />
      
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-color/10 text-primary-color">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">Categories</h1>
            <p className="text-text-dim">Browse our massive collection of games</p>
          </div>
        </div>

        {/* Categories Top Ad */}
        <div className="w-full flex justify-center pb-4">
           <AdBanner slot="categories-top-ad" format="horizontal" className="w-full max-w-[970px] h-[90px]" />
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Loading categories...</div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <LiveCategoryCard 
                key={cat.id} 
                cat={cat} 
                thumbnails={categoryThumbnails[cat.name.toLowerCase()] || []} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text-dim bg-card-bg rounded-2xl border border-border-color">
            No categories available yet.
          </div>
        )}
      </div>
    </>
  );
}
