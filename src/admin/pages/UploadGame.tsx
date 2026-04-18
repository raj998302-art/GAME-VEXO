import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Save, Tag, FileArchive, CheckCircle } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function UploadGame() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [gameFile, setGameFile] = useState<File | null>(null);
  
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
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Auto-generate slug if title block changes
    if (e.target.name === 'title') {
      const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, title: e.target.value, slug: autoSlug });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGameFile(e.target.files[0]);
    }
  };

  const storeGameDocument = async (finalGameUrl: string, finalSlug: string) => {
    const gameRef = doc(db, 'games', finalSlug);
    const gameToSave = {
      title: formData.title,
      slug: finalSlug,
      category: formData.category,
      theme: formData.theme,
      thumbnail: formData.thumbnail,
      banner: formData.banner,
      gameUrl: finalGameUrl,
      uploadType: uploadType,
      description: formData.description,
      controls: formData.controls,
      tags: formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(t => t.length > 0),
      status: 'approved', // Auto-approve admin uploads
      views: 0,
      rating: 0,
      likes: 0,
      playTime: 0,
      developerId: 'admin',
      developerName: 'Administrator',
      createdAt: serverTimestamp()
    };

    await setDoc(gameRef, gameToSave);
    alert('Game uploaded successfully!');
    navigate('/admin/games');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadType === 'file' && !gameFile) {
      alert("Please select a game file to upload.");
      return;
    }
    
    if (uploadType === 'file' && gameFile?.name.toLowerCase().endsWith('.zip')) {
      alert("Firebase Storage cannot host and run HTML5 .zip files directly!\n\nPlease host your HTML5 game on a free hosting site (like GitHub Pages, Vercel, Netlify, or itch.io) and then use the 'Link (URL)' option instead to embed it.");
      return;
    }

    if (uploadType === 'url' && !formData.gameUrl) {
      alert("Please provide a game URL.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const finalSlug = formData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      let finalGameUrl = formData.gameUrl;

      // Handle raw file upload
      if (uploadType === 'file' && gameFile) {
        const fileRef = ref(storage, `games/${finalSlug}/${gameFile.name}`);
        
        // Ensure HTML files are served inline
        const metadata = gameFile.name.toLowerCase().endsWith('.html') 
          ? { contentType: 'text/html', contentDisposition: 'inline' } 
          : undefined;

        const uploadTask = uploadBytesResumable(fileRef, gameFile, metadata);
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            console.error("Upload failed", error);
            alert(`Error uploading file: ${error.message}`);
            setIsSubmitting(false);
          }, 
          async () => {
            finalGameUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await storeGameDocument(finalGameUrl, finalSlug);
            setIsSubmitting(false);
          }
        );
        // Do not proceed with the regular flow, upload task handles the completion
        return;
      }
      
      await storeGameDocument(finalGameUrl, finalSlug);
      
    } catch (error: any) {
      console.error('Error submitting game:', error);
      alert('Error saving game to database/storage. Check your configuration.\n' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main">Upload Game</h1>
        <p className="text-text-dim">Add a new HTML5/APK/AAB game to the platform.</p>
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
                <option value="Sports">Sports</option>
                <option value="Casual">Casual</option>
                <option value="Adventure">Adventure</option>
                <option value="Strategy">Strategy</option>
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
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Game Source & Media</h2>
          
          <div className="space-y-6">
            
            <div className="flex bg-[#09090b] p-1 rounded-xl w-max border border-border-color mb-4">
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  uploadType === 'url' ? 'bg-primary-color text-white shadow-lg' : 'text-text-dim hover:text-white'
                }`}
              >
                Link (URL)
              </button>
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  uploadType === 'file' ? 'bg-primary-color text-white shadow-lg' : 'text-text-dim hover:text-white'
                }`}
              >
                Upload File (HTML, APK, AAB)
              </button>
            </div>

            {uploadType === 'url' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Game URL (Iframe/HTML5 Link)
                </label>
                <input 
                  type="url" 
                  name="gameUrl"
                  value={formData.gameUrl}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                  placeholder="https://example.com/game/index.html"
                />
                <p className="text-xs text-text-dim">Must support iframe embedding. Host HTML5 games on itch.io or your own server and paste the link here.</p>
              </div>
            ) : (
             <div className="space-y-2">
                <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                  <FileArchive className="w-4 h-4" /> Game File (HTML, APK, AAB)
                </label>
                <div className="relative w-full h-[120px] bg-[#09090b] border-2 border-dashed border-border-color rounded-xl hover:border-primary-color transition-colors flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-text-dim mb-2" />
                  <span className="text-sm font-medium text-text-dim">
                     {gameFile ? gameFile.name : 'Click to select HTML, APK, or AAB'}
                  </span>
                  <input 
                    type="file"
                    accept=".apk,.aab,.html"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {gameFile && (
                    <div className="absolute top-2 right-2 text-green-500 bg-bg-dark rounded-full p-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-dim">Supports .html (single file apps), .apk, .aab. No .zip files allowed. HTML uploads must be a single combined document.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

        {/* Details & Filters */}
        <div className="bg-card-bg border border-border-color rounded-[20px] p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Game Details & Discovery</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags (Comma separated)
              </label>
              <input 
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main"
                placeholder="e.g. 3d, multiplayer, cars, kids, funny"
              />
              <p className="text-xs text-text-dim">Tags help users search and filter games effectively.</p>
            </div>
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
          <div className="relative">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50 overflow-hidden relative z-10"
            >
              <Save className="w-5 h-5 relative z-10" />
              <span className="relative z-10">
                {isSubmitting 
                  ? (uploadProgress > 0 && uploadType === 'file' ? `Uploading... ${Math.round(uploadProgress)}%` : 'Publishing...') 
                  : 'Publish Game'}
              </span>
              
              {/* Progress Bar Background */}
              {isSubmitting && uploadType === 'file' && uploadProgress > 0 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-green-500/50 z-0 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
