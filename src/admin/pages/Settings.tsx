import { useState } from 'react';
import { Save, User, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [notificationStatus, setNotificationStatus] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === "granted") {
        new Notification("Notifications Enabled! 🚀", {
          body: "Welcome to GameVexo Admin. You will now receive important updates and alerts right here.",
          icon: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
        });
      } else if (permission === "denied") {
        alert("Notification permission was denied. You can change this in your browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main">Platform Settings</h1>
        <p className="text-text-dim">Configure global settings, profile, notifications, and social links.</p>
      </div>

      <div className="space-y-8">
        {/* Profile & Account Settings */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border-color pb-4">
            <User className="w-6 h-6 text-primary-color" />
            <h2 className="text-xl font-bold text-text-main">Profile & Account</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-text-dim">
              Manage your admin profile, change your display name, and update your profile picture (DP).
            </p>
            <Link 
              to="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-color/10 text-primary-color font-bold hover:bg-primary-color hover:text-white transition-all border border-primary-color/50"
            >
              Edit Profile Settings
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border-color pb-4">
            <Bell className="w-6 h-6 text-neon-pink" />
            <h2 className="text-xl font-bold text-text-main">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-text-dim">
              Enable browser notifications to stay updated on new game uploads, user reports, and system alerts.
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleEnableNotifications}
                disabled={notificationStatus === 'granted'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card-bg border border-border-color text-text-main font-bold hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bell className="w-4 h-4" />
                {notificationStatus === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
              </button>
              {notificationStatus === 'granted' && (
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">General Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Site Name</label>
              <input 
                type="text" 
                defaultValue="GameVexo"
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Site Description (SEO)</label>
              <textarea 
                defaultValue="The ultimate online gaming platform. Play thousands of free HTML5 games directly in your browser."
                rows={3}
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-border-color pb-4 text-text-main">Social Media Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Twitter URL</label>
              <input 
                type="url" 
                placeholder="https://twitter.com/..."
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">YouTube URL</label>
              <input 
                type="url" 
                placeholder="https://youtube.com/..."
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Instagram URL</label>
              <input 
                type="url" 
                placeholder="https://instagram.com/..."
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dim">Discord URL</label>
              <input 
                type="url" 
                placeholder="https://discord.gg/..."
                className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)]">
            <Save className="w-5 h-5" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
