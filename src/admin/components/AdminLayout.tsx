import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, Gamepad2, Settings, LogOut, LayoutGrid, Home, DollarSign, MessageCircle, CreditCard, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/helpers';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Upload, label: 'Upload Game', path: '/admin/upload' },
  { icon: Gamepad2, label: 'Manage Games', path: '/admin/games', badge: 'pendingGames' },
  { icon: Users, label: 'Manage Users', path: '/admin/users' },
  { icon: CreditCard, label: 'Payouts', path: '/admin/payouts' },
  { icon: LayoutGrid, label: 'Categories', path: '/admin/categories' },
  { icon: Home, label: 'Homepage Control', path: '/admin/homepage' },
  { icon: MessageCircle, label: 'Support Chats', path: '/admin/support' },
  { icon: DollarSign, label: 'Ads Management', path: '/admin/ads' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, isAdmin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingGamesCount, setPendingGamesCount] = useState(0);

  useEffect(() => {
    // Listen for pending games securely via client
    const q = query(collection(db, 'games'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPendingGamesCount(snap.docs.length);
    }, (err) => {
      console.warn("Could not fetch pending games count:", err);
    });
    return () => unsubscribe();
  }, []);

  // For demo purposes, we'll bypass actual auth check if user wants to see admin
  // In production, uncomment this:
  // if (!user || !isAdmin) return <Navigate to="/login" />;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main flex">
      {/* Admin Sidebar */}
      <aside className="w-[240px] bg-[rgba(9,9,11,0.9)] border-r border-border-color flex flex-col h-screen sticky top-0">
        <div className="p-6 h-[70px] flex items-center border-b border-border-color">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-display font-extrabold text-[20px] tracking-[-0.05em] text-text-main flex items-center gap-2.5">
              GAME<span className="text-primary-color neon-text">VEXO</span> ADMIN
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-[30px] flex flex-col gap-1 overflow-y-auto">
          <h4 className="text-[11px] uppercase tracking-[0.1em] text-text-dim mb-4 font-semibold">Menu</h4>
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const badgeCount = item.badge === 'pendingGames' ? pendingGamesCount : 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between py-2.5 text-[14px] font-medium transition-colors decoration-transparent group",
                  isActive ? "text-primary-color" : "text-text-main hover:text-primary-color"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                {badgeCount > 0 && (
                  <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-[30px] border-t border-border-color">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 text-[14px] font-medium text-text-main hover:text-red-500 transition-colors decoration-transparent w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-[30px]">
        <Outlet />
      </main>
    </div>
  );
}
