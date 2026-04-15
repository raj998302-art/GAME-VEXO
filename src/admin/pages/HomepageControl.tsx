import React, { useState } from 'react';
import { Home, Save, Image as ImageIcon } from 'lucide-react';

export default function HomepageControl() {
  const [formData, setFormData] = useState({
    heroTitle: 'CYBER STRIKE: REDLINE',
    heroSubtitle: 'The definitive HTML5 neon racer. Master the grid and outrun the system in the fastest browser-based experience of 2024.',
    heroBannerUrl: 'https://picsum.photos/seed/cyber/1200/500',
    heroGameSlug: 'cyber-strike',
    featuredGames: 'cyber-racer, neon-blaster, puzzle-quest, space-defender, pixel-dungeon, solar-siege',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving homepage config:', formData);
    alert('Homepage configuration saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main flex items-center gap-3">
          <Home className="w-8 h-8 text-primary-color" />
          Homepage Control
        </h1>
        <p className="text-text-dim">Manage the hero banner and featured games on the homepage.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Hero Banner</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hero Banner Image URL
              </label>
              <input 
                type="url" 
                name="heroBannerUrl"
                value={formData.heroBannerUrl}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="https://..."
                required
              />
              {formData.heroBannerUrl && (
                <div className="mt-4 aspect-[21/9] rounded-xl overflow-hidden border border-border-color relative">
                  <img src={formData.heroBannerUrl} alt="Hero preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-3xl font-black text-white mb-2">{formData.heroTitle}</h3>
                    <p className="text-white/80 max-w-md">{formData.heroSubtitle}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim">Hero Title</label>
                <input 
                  type="text" 
                  name="heroTitle"
                  value={formData.heroTitle}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim">Target Game Slug</label>
                <input 
                  type="text" 
                  name="heroGameSlug"
                  value={formData.heroGameSlug}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                  placeholder="e.g. cyber-strike"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Hero Subtitle</label>
              <textarea 
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                rows={2}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                required
              />
            </div>
          </div>
        </div>

        {/* Featured Games */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Featured Games Slider</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dim">Featured Game Slugs (Comma separated)</label>
            <textarea 
              name="featuredGames"
              value={formData.featuredGames}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
              placeholder="game-1, game-2, game-3..."
              required
            />
            <p className="text-xs text-text-dim mt-1">These games will appear in the "Recently Added" or "Featured" section on the homepage.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)]">
            <Save className="w-5 h-5" />
            Save Homepage Layout
          </button>
        </div>
      </form>
    </div>
  );
}
