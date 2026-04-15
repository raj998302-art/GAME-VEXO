import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Save } from 'lucide-react';

export default function UploadGame() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Action',
    theme: 'default',
    thumbnail: '',
    banner: '',
    gameUrl: '',
    description: '',
    controls: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting game:', formData);
    // Add Firebase logic here
    alert('Game uploaded successfully! (Demo)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main">Upload Game</h1>
        <p className="text-text-dim">Add a new HTML5 game to the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Game Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="e.g. Cyber Racer 2077"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Slug (URL)</label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="e.g. cyber-racer-2077"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
              >
                <option value="Action">Action</option>
                <option value="Racing">Racing</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Arcade">Arcade</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Theme</label>
              <select 
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
              >
                <option value="default">Default</option>
                <option value="theme-neon">Neon Gaming</option>
                <option value="theme-kids">Kids Gaming</option>
                <option value="theme-horror">Horror Gaming</option>
                <option value="theme-retro">Retro Arcade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media & URLs */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Media & URLs</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> HTML5 Game URL
              </label>
              <input 
                type="url" 
                name="gameUrl"
                value={formData.gameUrl}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="https://example.com/game/index.html"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Thumbnail URL (600x400)
                </label>
                <input 
                  type="url" 
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                  placeholder="https://..."
                  required
                />
                {formData.thumbnail && (
                  <div className="mt-2 aspect-[4/3] rounded-xl overflow-hidden border border-border-color">
                    <img src={formData.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Banner URL (1200x600)
                </label>
                <input 
                  type="url" 
                  name="banner"
                  value={formData.banner}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                  placeholder="https://..."
                />
                {formData.banner && (
                  <div className="mt-2 aspect-[2/1] rounded-xl overflow-hidden border border-border-color">
                    <img src={formData.banner} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Game Details</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="Describe the game..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Controls Instructions</label>
              <textarea 
                name="controls"
                value={formData.controls}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="e.g. Use WASD to move, Space to jump..."
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" className="px-6 py-3 rounded-xl font-medium text-text-main hover:bg-white/5 transition-colors">
            Save as Draft
          </button>
          <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)]">
            <Save className="w-5 h-5" />
            Publish Game
          </button>
        </div>
      </form>
    </div>
  );
}
