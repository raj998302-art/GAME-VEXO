import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
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

        {isLoading ? (
          <div className="text-center py-10 text-text-dim">Loading categories...</div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.name.toLowerCase()}`}
                className="group relative rounded-[20px] overflow-hidden aspect-[4/3] glass-panel border border-border-color hover:border-primary-color transition-colors duration-200"
              >
                <img 
                  src={cat.image || `https://picsum.photos/seed/${cat.name}/800/600`} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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
