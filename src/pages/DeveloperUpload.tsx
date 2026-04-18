import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { collection, doc, setDoc, serverTimestamp, query, where, onSnapshot, getDocs, limit, orderBy, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Upload, Link as LinkIcon, ShieldCheck, FileArchive, Trophy, DollarSign, Star, CheckCircle, Clock, XCircle, Gamepad2, Wallet } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function DeveloperUpload() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [myGames, setMyGames] = useState<any[]>([]);
  const [top3GameIds, setTop3GameIds] = useState<string[]>([]);
  
  // Payout states
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawDetails, setWithdrawDetails] = useState({upi: '', amount: '', screenshot: ''});
  const [isApplying, setIsApplying] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Action',
    thumbnail: '',
    gameUrl: '',
    privacyPolicyUrl: '',
  });

  useEffect(() => {
    if (!user) return;
    
    // Listen to developer's games live
    const q = query(
      collection(db, 'games'), 
      where('developerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually by creation time
      data.sort((a, b) => {
         if (!a.createdAt || !b.createdAt) return 0;
         return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
      setMyGames(data);
    }, (error) => {
       console.error("Error fetching my games:", error);
    });

    const fetchTop3 = async () => {
      try {
        const topQ = query(collection(db, 'games'), where('status', '==', 'approved'), orderBy('views', 'desc'), limit(3));
        const snap = await getDocs(topQ);
        setTop3GameIds(snap.docs.map(d => d.id));
      } catch (err) {
        console.warn("Could not fetch top 3 games here:", err);
      }
    };
    fetchTop3();
    
    return () => unsubscribe();
  }, [user]);

  const hasTop3Game = myGames.some(game => top3GameIds.includes(game.id));

  const handleApplyWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user || !hasTop3Game) return;
    setIsApplying(true);
    try {
      await addDoc(collection(db, 'payouts'), {
        userId: user.uid,
        userName: user.displayName || 'Unknown',
        email: user.email,
        upiDetails: withdrawDetails.upi,
        amountRequested: withdrawDetails.amount,
        proofScreenshotUrl: withdrawDetails.screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setWithdrawMsg("✅ Payout application submitted! Admin will review soon.");
      setWithdrawDetails({upi: '', amount: '', screenshot: ''});
      setTimeout(() => setShowWithdraw(false), 3000);
    } catch (error) {
      console.error(error);
      setWithdrawMsg("❌ Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGameFile(e.target.files[0]);
    }
  };

  const storeGameDocument = async (finalGameUrl: string) => {
    if (!user) return;
    const baseSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      
    await setDoc(doc(db, 'games', slug), {
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
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'Action',
      thumbnail: '',
      gameUrl: '',
      privacyPolicyUrl: '',
    });
    setGameFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to upload a game.");
    if (uploadType === 'file' && !gameFile) return alert("Please select a game file to upload.");
    
    if (uploadType === 'file' && gameFile) {
      if (gameFile.size > 128 * 1024 * 1024) { // 128MB Limit for Free tier mostly
         alert("File size exceeds 128MB. Please optimize or host externally and use URL method.");
         return;
      }
      
      if (gameFile.name.toLowerCase().endsWith('.zip')) {
        alert("Firebase Storage cannot host and run HTML5 .zip files directly!\n\nPlease host your HTML5 game on a free hosting site (like GitHub Pages, Vercel, Netlify, or itch.io) and then use the 'Link (URL)' option instead to embed it.");
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      let finalGameUrl = formData.gameUrl;

      if (uploadType === 'file' && gameFile) {
        const storageRef = ref(storage, `games/${user.uid}/${Date.now()}_${gameFile.name}`);
        
        // Ensure single HTML files are served correctly to the iframe
        const metadata = gameFile.name.toLowerCase().endsWith('.html') 
          ? { contentType: 'text/html', contentDisposition: 'inline' } 
          : undefined;

        const uploadTask = uploadBytesResumable(storageRef, gameFile, metadata);
        
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
            await storeGameDocument(finalGameUrl);
            setIsSubmitting(false);
          }
        );
        return; // wait for upload task callback
      }

      await storeGameDocument(finalGameUrl);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting game:", error);
      alert("Failed to submit game.");
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-text-main flex flex-col items-center justify-center min-h-[50vh]">
        <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold mb-4">Join the Elite Developer Program!</h2>
        <p className="text-text-dim mb-6 max-w-md">Login or sign up now to publish your games on GameVexo and earn real revenue!</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-primary-color rounded-xl font-bold text-white shadow-[0_0_15px_var(--primary-glow)]">Go to Login</button>
      </div>
    );
  }

  return (
    <>
      <SEO title="Submit Game | Developer Program | GameVexo" description="Publish your HTML5 game on GameVexo and earn 10% ad revenue share if your game reaches the Top 3!" />
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Pitch Hero Section */}
        <div className="bg-gradient-to-br from-[#09090b] to-[#1a1a2e] border border-primary-color/30 rounded-[20px] p-8 relative overflow-hidden shadow-[0_0_30px_rgba(255,0,85,0.15)]">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary-color/20 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 rounded-full text-xs font-bold uppercase tracking-wider">
                <Star className="w-4 h-4" />
                RevShare Program Live
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Earn <span className="text-primary-color drop-shadow-[0_0_10px_var(--primary-glow)]">10% Ad Revenue</span> on your games!
              </h1>
              <p className="text-text-dim text-lg leading-relaxed">
                Submit your masterpiece to GameVexo. If your game climbs to the <strong>Top 1, Top 2, or Top 3</strong> position on our leaderboard based on views and popularity, you unlock exactly 10% of the total ad revenue it generates!
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <li className="flex items-center gap-2 text-sm text-text-main">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Free to upload & publish
                </li>
                <li className="flex items-center gap-2 text-sm text-text-main">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Fast admin review
                </li>
                <li className="flex items-center gap-2 text-sm text-text-main">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Fair ranking system
                </li>
                <li className="flex items-center gap-2 text-sm text-text-main">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Easy bank/UPI payouts
                </li>
              </ul>
            </div>
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-black/40 rounded-full border-4 border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
              <DollarSign className="w-20 h-20 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* My Games Section */}
        {myGames.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-border-color space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-text-main border-b border-border-color pb-4">
              <Gamepad2 className="w-5 h-5 text-primary-color" />
              My Submissions ({myGames.length})
            </h2>

            {/* Top 3 Active Check */}
            {hasTop3Game ? (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="font-bold text-yellow-500 flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Elite Developer Status Unlocked!
                  </h3>
                  <p className="text-sm text-text-dim">One of your games is currently in the Top 3 leaderboard. You are eligible for the 10% Ad Revenue split.</p>
                </div>
                <button 
                  onClick={() => setShowWithdraw(!showWithdraw)}
                  className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg shrink-0 hover:bg-yellow-400"
                >
                  Withdraw Revenue
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-bg-dark border border-border-color rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between opacity-80">
                <div>
                  <h3 className="font-bold text-text-dim flex items-center gap-2">
                    <Trophy className="w-5 h-5 opacity-50" /> Elite Status Locked
                  </h3>
                  <p className="text-sm text-text-dim mt-1">Get any of your games into the Global Top 3 Leaderboard to unlock ad revenue sharing.</p>
                </div>
              </div>
            )}

            {/* Withdraw Form */}
            {showWithdraw && hasTop3Game && (
              <div className="mb-8 p-6 bg-black/40 border border-border-color rounded-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-green-500"/> Submit Payout Request</h3>
                <form onSubmit={handleApplyWithdraw} className="space-y-4">
                  {withdrawMsg && <div className="text-sm font-bold text-primary-color mb-2">{withdrawMsg}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-dim mb-1">Bank / UPI Details / PayPal</label>
                      <input required type="text" value={withdrawDetails.upi} onChange={e=>setWithdrawDetails({...withdrawDetails, upi: e.target.value})} className="w-full bg-bg-dark border border-border-color rounded-lg px-3 py-2 text-sm text-white focus:border-primary-color" placeholder="e.g. user@ybl or Bank Acc Details" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-dim mb-1">Requested Amount ($)</label>
                      <input required type="number" value={withdrawDetails.amount} onChange={e=>setWithdrawDetails({...withdrawDetails, amount: e.target.value})} className="w-full bg-bg-dark border border-border-color rounded-lg px-3 py-2 text-sm text-white focus:border-primary-color" placeholder="e.g. 150" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-dim mb-1">Screenshot Proof URL (Dashboard/Analytics)</label>
                    <input required type="url" value={withdrawDetails.screenshot} onChange={e=>setWithdrawDetails({...withdrawDetails, screenshot: e.target.value})} className="w-full bg-bg-dark border border-border-color rounded-lg px-3 py-2 text-sm text-white focus:border-primary-color" placeholder="https://..." />
                  </div>
                  <button disabled={isApplying} type="submit" className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">
                    {isApplying ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {myGames.map(game => (
                <div key={game.id} className="flex items-center gap-4 bg-bg-dark rounded-xl p-3 border border-border-color">
                   <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} alt="" className="w-16 h-16 rounded-lg object-cover" />
                   <div className="flex-1">
                     <h3 className="font-bold text-text-main">{game.title}</h3>
                     <p className="text-xs text-text-dim">
                        Submitted: {game.createdAt ? format(game.createdAt.toDate(), 'PPP') : 'Unknown Date'}
                     </p>
                   </div>
                   <div className="text-right">
                     <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                       game.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                       game.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                       'bg-red-500/20 text-red-500'
                     }`}>
                       {game.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                       {game.status === 'pending' && <Clock className="w-3 h-3" />}
                       {game.status === 'rejected' && <XCircle className="w-3 h-3" />}
                       {game.status.toUpperCase()}
                     </span>
                     {game.status === 'approved' && (
                       <p className="text-xs text-text-dim mt-1.5">{game.views?.toLocaleString() || 0} hits</p>
                     )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-6 border border-border-color">
          <div className="flex flex-col items-center gap-2 mb-6 border-b border-border-color pb-6">
            <h2 className="text-2xl font-bold text-text-main">Upload Your Game</h2>
            <p className="text-text-dim text-sm text-center">Fill out the details below. All submissions are manually reviewed to ensure a great player experience.</p>
          </div>

          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dim mb-2">Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                >
                  <option>Action</option>
                  <option>Racing</option>
                  <option>Puzzle</option>
                  <option>Arcade</option>
                  <option>Sports</option>
                  <option>Casual</option>
                  <option>Adventure</option>
                  <option>Strategy</option>
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

            <div className="pt-6 border-t border-border-color">
              <label className="block text-sm font-medium text-text-dim mb-4">Game Source *</label>
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`flex-1 py-3 rounded-xl border transition-colors font-semibold ${uploadType === 'url' ? 'bg-primary-color text-white shadow-[0_0_15px_var(--primary-glow)] border-primary-color' : 'bg-bg-dark border-border-color text-text-dim hover:text-white'}`}
                >
                  Provide Web URL (HTML5)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-3 rounded-xl border transition-colors font-semibold ${uploadType === 'file' ? 'bg-primary-color text-white shadow-[0_0_15px_var(--primary-glow)] border-primary-color' : 'bg-bg-dark border-border-color text-text-dim hover:text-white'}`}
                >
                  Upload File (HTML, APK, AAB)
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
                  <p className="mt-2 text-xs text-text-dim">Must support iframe embedding. Host HTML5 games on itch.io or your own server and paste the link here.</p>
                </div>
              ) : (
                <div className="relative">
                  <input 
                    type="file" 
                    id="game-file-upload"
                    required={uploadType === 'file'}
                    accept=".apk,.aab,.html"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="game-file-upload"
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl p-8 hover:border-primary-color transition-colors cursor-pointer bg-bg-dark"
                  >
                    <FileArchive className="w-8 h-8 text-text-dim mb-3" />
                    <span className="text-text-main font-medium">{gameFile ? gameFile.name : 'Click to upload game file'}</span>
                    <span className="text-text-dim text-sm mt-1 mb-2">Supports .html (single file apps), .apk, .aab</span>
                    <span className="text-text-dim text-xs text-center border-t border-border-color pt-2 max-w-sm">No .zip files allowed. HTML uploads must be a single combined document. Max recommended size: ~100MB</span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border-color">
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
            </div>
          </div>

          <div className="pt-6 border-t border-border-color">
            <div className="relative">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary-color text-white font-bold text-lg hover:bg-primary-color/90 transition-all shadow-[0_0_20px_var(--primary-glow)] disabled:opacity-50 overflow-hidden relative z-10"
              >
                <Upload className="w-6 h-6 relative z-10" />
                <span className="relative z-10">
                  {isSubmitting 
                    ? (uploadProgress > 0 && uploadType === 'file' ? `Uploading... ${Math.round(uploadProgress)}%` : 'Uploading to Server...') 
                    : 'Submit for Review'}
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
    </>
  );
}
