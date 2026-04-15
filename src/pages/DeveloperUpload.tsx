import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Upload, Link as LinkIcon, ShieldCheck, FileArchive } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

export default function DeveloperUpload() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [gameFile, setGameFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Action',
    thumbnail: '',
    gameUrl: '',
    privacyPolicyUrl: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGameFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to upload a game.");
    if (uploadType === 'file' && !gameFile) return alert("Please select a game file to upload.");
    
    setIsSubmitting(true);
    try {
      let finalGameUrl = formData.gameUrl;

      // If uploading a file, upload to Firebase Storage first
      if (uploadType === 'file' && gameFile) {
        const storageRef = ref(storage, `games/${user.uid}/${Date.now()}_${gameFile.name}`);
        await uploadBytes(storageRef, gameFile);
        finalGameUrl = await getDownloadURL(storageRef);
      }

      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      await addDoc(collection(db, 'games'), {
        ...formData,
        gameUrl: finalGameUrl,
        uploadType,
        slug,
        developerId: user.uid,
        developerName: user.displayName || 'Unknown Developer',
        status: 'pending',
        views: 0,
        likes: 0,
        playTime: 0,
        createdAt: serverTimestamp()
      });
      
      alert("Game submitted successfully! It is now pending admin approval.");
      navigate('/profile');
    } catch (error) {
      console.error("Error submitting game:", error);
      alert("Failed to submit game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-text-main">Please login to submit a game.</div>;

  return (
    <>
      <SEO title="Submit Game | GameVexo" description="Publish your HTML5 game on GameVexo." />
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-text-main">Developer Portal</h1>
          <p className="text-text-dim">Submit your game to GameVexo. All submissions are reviewed by our team before going live.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dim mb-2">Game Title *</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                placeholder="e.g. Epic Space Shooter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dim mb-2">Description *</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors resize-none"
                placeholder="Describe your game..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dim mb-2">Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                >
                  <option>Action Arcade</option>
                  <option>Battle Royale</option>
                  <option>Strategy HQ</option>
                  <option>Retro Classics</option>
                  <option>Sports & Racing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-2">Thumbnail URL *</label>
                <input 
                  type="url" 
                  required
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border-color">
              <label className="block text-sm font-medium text-text-dim mb-4">Game Source *</label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`flex-1 py-3 rounded-xl border transition-colors ${uploadType === 'url' ? 'bg-primary-color/10 border-primary-color text-primary-color' : 'bg-bg-dark border-border-color text-text-dim hover:border-primary-color/50'}`}
                >
                  Provide URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-3 rounded-xl border transition-colors ${uploadType === 'file' ? 'bg-primary-color/10 border-primary-color text-primary-color' : 'bg-bg-dark border-border-color text-text-dim hover:border-primary-color/50'}`}
                >
                  Upload File
                </button>
              </div>

              {uploadType === 'url' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="w-5 h-5 text-text-dim" />
                  </div>
                  <input 
                    type="url" 
                    required={uploadType === 'url'}
                    value={formData.gameUrl}
                    onChange={(e) => setFormData({...formData, gameUrl: e.target.value})}
                    className="w-full bg-bg-dark border border-border-color rounded-xl pl-11 pr-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                    placeholder="https://your-game-host.com/index.html"
                  />
                </div>
              ) : (
                <div className="relative">
                  <input 
                    type="file" 
                    id="game-file-upload"
                    required={uploadType === 'file'}
                    accept=".zip,.apk,.aab"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="game-file-upload"
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl p-8 hover:border-primary-color transition-colors cursor-pointer bg-bg-dark"
                  >
                    <FileArchive className="w-8 h-8 text-text-dim mb-2" />
                    <span className="text-text-main font-medium">{gameFile ? gameFile.name : 'Click to upload game file'}</span>
                    <span className="text-text-dim text-sm mt-1">Supports .zip (HTML5), .apk, .aab</span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-color">
              <label className="block text-sm font-medium text-text-dim mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-color" />
                Privacy Policy URL *
              </label>
              <input 
                type="url" 
                required
                value={formData.privacyPolicyUrl}
                onChange={(e) => setFormData({...formData, privacyPolicyUrl: e.target.value})}
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                placeholder="Link to your game's privacy policy"
              />
              <p className="text-xs text-text-dim mt-2">Required for publishing on GameVexo.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-color">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-all shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
