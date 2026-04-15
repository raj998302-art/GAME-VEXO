import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase/config';
import { User, Camera, Save, LogOut, Trophy, Gamepad2, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    score: 0,
    gamesPlayed: 0,
    playTime: '0h',
    memberSince: new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      
      // Fetch from Firestore
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
              memberSince: data.createdAt ? new Date(data.createdAt).getFullYear().toString() : new Date().getFullYear().toString()
            });
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.warn("Firestore is offline. Using default profile stats.");
          } else {
            console.error("Error fetching profile:", error);
          }
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser!, {
        displayName: displayName,
        photoURL: photoURL
      });

      // Update Firestore
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          displayName,
          photoURL,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (firestoreError) {
        if (firestoreError instanceof Error && firestoreError.message.includes('the client is offline')) {
          console.warn("Firestore is offline. Profile updated in Auth only.");
        } else {
          throw firestoreError;
        }
      }
      
      // Update local store
      setUser({ ...user, displayName, photoURL } as any);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
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

  if (!user) return <div className="p-8 text-center text-text-main">Please login to view your profile.</div>;

  return (
    <>
      <SEO title="My Profile | GameVexo" description="Manage your GameVexo profile." />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-main">My Profile</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="md:col-span-2 glass-panel p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-text-main border-b border-border-color pb-4">Account Settings</h2>
            
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

          {/* Stats & Memory */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
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
              <h2 className="text-lg font-bold text-text-main mb-2">GameVexo Memory</h2>
              <p className="text-sm text-text-dim mb-4">You've been a member of the GameVexo community since {stats.memberSince}. Keep playing to unlock more achievements!</p>
              <div className="w-full bg-bg-dark rounded-full h-2 mb-2">
                <div className="bg-primary-color h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-right text-primary-color font-mono">Level 4</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
