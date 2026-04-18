import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { doc, getDoc, setDoc, query, collection, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase/config';
import { User, Camera, Save, LogOut, Trophy, Gamepad2, Clock, Star, DollarSign, UploadCloud, ChevronRight, Activity, Wallet, FileText, Download, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [stats, setStats] = useState({
    score: 0,
    gamesPlayed: 0,
    playTime: '0h',
    memberSince: new Date().getFullYear().toString(),
    lastClaimedDaily: null as string | null
  });

  // Developer specific state
  const [myGames, setMyGames] = useState<any[]>([]);
  const [top3GameIds, setTop3GameIds] = useState<string[]>([]); // To check if any of user's games are in top 3
  const [totalViews, setTotalViews] = useState(0);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawDetails, setWithdrawDetails] = useState({ upi: '', amount: '', screenshot: '' });
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      
      // Fetch User Stats
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.displayName) setDisplayName(data.displayName);
            if (data.photoURL) setPhotoURL(data.photoURL);
            setStats({
              score: data.score || 0,
              gamesPlayed: data.gamesPlayed || 0,
              playTime: data.playTime || '0h',
              memberSince: data.createdAt ? new Date(data.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
              lastClaimedDaily: data.lastClaimedDaily || null
            });
          }
        } catch (error) {
          console.warn("Could not fetch user stats:", error);
        }
      };
      
      // Fetch Developer Games
      const fetchDeveloperData = async () => {
        try {
          const gamesRef = collection(db, 'games');
          
          // Get user's games
          const myGamesQ = query(gamesRef, where('developerId', '==', user.uid));
          const myGamesSnap = await getDocs(myGamesQ);
          const myGamesData = myGamesSnap.docs.map(d => ({id: d.id, ...d.data()} as any));
          
          setMyGames(myGamesData);
          setTotalViews(myGamesData.reduce((acc, g) => acc + (g.views || 0), 0));

          // Get top 3 games on the platform via client-side sort to avoid index errors
          const approvedGamesQ = query(gamesRef, where('status', '==', 'approved'));
          const topGamesSnap = await getDocs(approvedGamesQ);
          const allApproved = topGamesSnap.docs.map(d => ({id: d.id, ...d.data()} as any));
          allApproved.sort((a,b) => (b.views || 0) - (a.views || 0));
          const top3Ids = allApproved.slice(0, 3).map(d => d.id);
          setTop3GameIds(top3Ids);
          
        } catch (error) {
          console.error("Error fetching developer data:", error);
        }
      };

      fetchProfile();
      fetchDeveloperData();
    }
  }, [user]);

  const hasTop3Game = myGames.some(game => top3GameIds.includes(game.id));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
       setNotification({ type: 'error', text: 'Image size must be less than 5MB.' });
       return;
    }

    setIsUploading(true);
    setNotification(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 jpeg to save space
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

          // Auto-save the image
          await updateProfile(auth.currentUser!, { photoURL: dataUrl });
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, { photoURL: dataUrl, updatedAt: new Date().toISOString() }, { merge: true });
          
          setUser({ ...user, photoURL: dataUrl } as any);
          setPhotoURL(dataUrl);
          setNotification({ type: 'success', text: 'Profile picture updated successfully!' });
        } catch (error) {
          console.error("Error processing image:", error);
          setNotification({ type: 'error', text: 'Failed to process image. Please try again.' });
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setNotification({ type: 'error', text: 'Failed to read file.' });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setNotification(null);
    try {
      await updateProfile(auth.currentUser!, { displayName });
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { displayName, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.warn("Firestore save failed, Auth profile updated though.");
      }
      setUser({ ...user, displayName, photoURL } as any);
      setNotification({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000); 
    } catch (error) {
      console.error("Error saving profile:", error);
      setNotification({ type: 'error', text: 'Failed to save profile.' });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out.");
    }
  };

  const todayStr = new Date().toDateString();
  const canClaimDaily = stats.lastClaimedDaily !== todayStr;

  const handleClaimDaily = async () => {
    if (!user || !canClaimDaily) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { 
        score: stats.score + 50, 
        lastClaimedDaily: todayStr,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setStats(prev => ({ ...prev, score: prev.score + 50, lastClaimedDaily: todayStr }));
      alert("🎉 You claimed your daily 50 XP!");
    } catch (error) {
      console.error("Error claiming daily:", error);
      alert("Failed to claim daily reward.");
    }
  };

  if (!user) return <div className="p-8 text-center text-text-main">Please login to view your profile.</div>;

  return (
    <>
      <SEO title="My Profile | GameVexo" description="Manage your GameVexo profile." />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-text-main">My Dashboard</h1>
          <div className="flex gap-4">
            <Link to="/developer/upload" className="flex items-center gap-2 px-4 py-2 bg-primary-color text-white hover:bg-primary-color/90 rounded-xl transition-colors font-bold shadow-[0_0_15px_var(--primary-glow)]">
              <UploadCloud className="w-5 h-5" />
              Upload Game
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-text-dim/10 text-text-dim hover:text-white rounded-xl transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Developer Section */}
            {(myGames.length > 0 || hasTop3Game) && (
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#09090b] border border-primary-color/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(255,0,85,0.05)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary-color" /> 
                    Developer Stats
                  </h2>
                  <div className="text-sm px-3 py-1 bg-primary-color/20 text-primary-color rounded-full font-mono font-bold">
                    {totalViews.toLocaleString()} Total Views
                  </div>
                </div>

                {hasTop3Game && (
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
                  <h3 className="font-bold text-text-dim text-sm uppercase tracking-wider mb-2">My Uploaded Games ({myGames.length})</h3>
                  {myGames.length === 0 ? (
                    <p className="text-text-dim text-sm">You haven't uploaded any games yet.</p>
                  ) : (
                    myGames.map(game => {
                      const isTop3 = top3GameIds.includes(game.id);
                      return (
                        <div key={game.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isTop3 ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-bg-dark border-border-color'}`}>
                          <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} className="w-12 h-12 rounded bg-black object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate flex items-center gap-2">
                              {game.title} 
                              {isTop3 && <Trophy className="w-3.5 h-3.5 text-yellow-500" title="Top 3 Leaderboard!" />}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-text-dim">
                              <span className={game.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}>{game.status.toUpperCase()}</span>
                              <span>•</span>
                              <span>{game.views?.toLocaleString() || 0} Views</span>
                            </div>
                          </div>
                          {game.status === 'approved' && (
                            <Link to={`/game/${game.slug || game.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Profile Settings */}
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <h2 className="text-xl font-bold text-text-main border-b border-border-color pb-4">Account Settings</h2>
              
              {notification && (
                <div className={`p-4 rounded-xl border ${notification.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} flex items-center gap-2 font-medium`}>
                  {notification.type === 'error' ? <XCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                  {notification.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-32 h-32 rounded-full bg-card-bg border-4 border-primary-color flex items-center justify-center overflow-hidden shrink-0">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-text-dim" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="avatar-upload" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-text-main rounded-xl cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Change Picture
                    </label>
                  </div>
                  <p className="text-sm text-text-dim">Recommended size: 256x256px. Max file size: 2MB.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-text-dim mb-2">Email (Cannot be changed)</label>
                  <input 
                    type="email" 
                    value={user.email || ''} 
                    disabled 
                    className="w-full bg-black/50 border border-border-color rounded-xl px-4 py-3 text-text-dim opacity-70 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-dim mb-2">Username</label>
                  <input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border-color flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-color text-white font-semibold rounded-xl hover:bg-primary-color/90 transition-all shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats & Memory (Right Col) */}
          <div className="space-y-6">

             {/* Daily Bonus */}
             <div className="glass-panel p-6 rounded-2xl bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Daily Bonus
              </h2>
              <p className="text-sm text-text-dim mb-4">Claim your daily 50 XP to climb the global leaderboard!</p>
              
              <button 
                onClick={handleClaimDaily}
                disabled={!canClaimDaily}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]"
              >
                {canClaimDaily ? 'Claim 50 XP' : 'Come back tomorrow!'}
              </button>
             </div>

            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-green-500" />
                Player Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-bg-dark rounded-xl border border-border-color">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary-color" />
                    <span className="text-text-dim">Total Score</span>
                  </div>
                  <span className="font-mono font-bold text-text-main">{stats.score.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-bg-dark rounded-xl border border-border-color">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5 text-green-500" />
                    <span className="text-text-dim">Games Played</span>
                  </div>
                  <span className="font-mono font-bold text-text-main">{stats.gamesPlayed}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-bg-dark rounded-xl border border-border-color">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-text-dim">Play Time</span>
                  </div>
                  <span className="font-mono font-bold text-text-main">{stats.playTime}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-primary-color/10 to-transparent border-primary-color/30">
              <h2 className="text-lg font-bold text-text-main mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> Level Up</h2>
              <p className="text-sm text-text-dim mb-4">You've been a member of the GameVexo community since {stats.memberSince}. Keep playing & unlocking to achieve higher levels!</p>
              <div className="w-full bg-bg-dark rounded-full h-2 mb-2 relative overflow-hidden">
                <div className="bg-primary-color h-2 rounded-full shadow-[0_0_10px_var(--primary-glow)] transition-all duration-500" style={{ width: `${(stats.score % 100) || 5}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                 <span className="text-text-dim">{stats.score % 100} / 100 XP</span>
                 <p className="text-primary-color font-mono font-bold text-sm">Level {Math.floor(stats.score / 100) + 1}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
