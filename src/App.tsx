import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import GamePlay from './pages/GamePlay';
import Categories from './pages/Categories';
import CategoryView from './pages/CategoryView';
import Trending from './pages/Trending';
import Favorites from './pages/Favorites';
import Recent from './pages/Recent';
import LegalPage from './pages/LegalPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import DeveloperUpload from './pages/DeveloperUpload';
import Leaderboard from './pages/Leaderboard';
import Search from './pages/Search';

// Admin
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import UploadGame from './admin/pages/UploadGame';
import ManageGames from './admin/pages/ManageGames';
import ManageCategories from './admin/pages/ManageCategories';
import Settings from './admin/pages/Settings';
import AdsManagement from './admin/pages/AdsManagement';
import HomepageControl from './admin/pages/HomepageControl';
import SupportChats from './admin/pages/SupportChats';

export default function App() {
  const { setUser, setIsAdmin, setLoading } = useAuthStore();

  useEffect(() => {
    // Anti-inspect and anti-copy measures
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setIsAdmin(user.email === 'raj998302@gmail.com' || user.uid === 'flO0mkC5v9go1BLBI1eJoAsgsun2');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      unsubscribe();
    };
  }, [setUser, setIsAdmin, setLoading]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="game/:slug" element={<GamePlay />} />
            <Route path="categories" element={<Categories />} />
            <Route path="category/:slug" element={<CategoryView />} />
            <Route path="trending" element={<Trending />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="recent" element={<Recent />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="search" element={<Search />} />
            
            {/* Legal Pages */}
            <Route path="privacy" element={<LegalPage title="Privacy Policy" content={
              <div className="space-y-6 text-text-dim leading-relaxed">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h3 className="text-xl font-bold text-text-main mt-6">1. Information We Collect</h3>
                <p>We collect information you provide directly to us when you create an account, update your profile, or communicate with us. This may include your name, email address, and profile picture.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">2. How We Use Your Information</h3>
                <p>We use the information we collect to provide, maintain, and improve our services, to process your requests, and to communicate with you about games, updates, and other information related to GameVexo.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">3. Data Security</h3>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">4. Cookies</h3>
                <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information to improve and analyze our service.</p>
              </div>
            } />} />
            <Route path="terms" element={<LegalPage title="Terms of Service" content={
              <div className="space-y-6 text-text-dim leading-relaxed">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h3 className="text-xl font-bold text-text-main mt-6">1. Acceptance of Terms</h3>
                <p>By accessing and using GameVexo, you accept and agree to be bound by the terms and provision of this agreement.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">2. User Conduct</h3>
                <p>You agree not to use the service to post or transmit any material which is or may be infringing on intellectual property rights of others, harassing, threatening, false, misleading, or otherwise unlawful.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">3. Intellectual Property</h3>
                <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of GameVexo or its content suppliers and protected by international copyright laws.</p>
              </div>
            } />} />
            <Route path="disclaimer" element={<LegalPage title="Disclaimer" content={
              <div className="space-y-6 text-text-dim leading-relaxed">
                <p>The information provided by GameVexo on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the site.</p>
                <p>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>
              </div>
            } />} />
            <Route path="about" element={<LegalPage title="About Us" content={
              <div className="space-y-6 text-text-dim leading-relaxed">
                <h3 className="text-2xl font-bold text-text-main mb-4">Welcome to GameVexo</h3>
                <p>GameVexo is your ultimate destination for free online browser games. Our mission is to provide a seamless, high-quality gaming experience for players around the world, without the need for downloads or installations.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">Our Vision</h3>
                <p>We believe that gaming should be accessible to everyone. Whether you're on a high-end gaming PC or a mobile phone, GameVexo brings the best HTML5 games right to your fingertips.</p>
                <h3 className="text-xl font-bold text-text-main mt-6">What We Offer</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Thousands of free-to-play games across multiple genres.</li>
                  <li>A vibrant community of gamers and developers.</li>
                  <li>Cross-platform compatibility (Play on PC, Tablet, or Mobile).</li>
                  <li>Regular updates with new and trending games.</li>
                </ul>
              </div>
            } />} />
            <Route path="contact" element={<LegalPage title="Contact Us" content={
              <div className="space-y-6 text-text-dim leading-relaxed">
                <p>We'd love to hear from you! Whether you have a question about a game, need technical support, or just want to share your feedback, our team is ready to answer all your questions.</p>
                <div className="bg-card-bg p-6 rounded-xl border border-border-color mt-6">
                  <h3 className="text-xl font-bold text-text-main mb-4">Get in Touch</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <span className="text-primary-color font-bold">Email:</span>
                      <a href="mailto:support@gamevexo.com" className="hover:text-primary-color transition-colors">support@gamevexo.com</a>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-color font-bold">Business Inquiries:</span>
                      <a href="mailto:business@gamevexo.com" className="hover:text-primary-color transition-colors">business@gamevexo.com</a>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-color font-bold">Address:</span>
                      <span>123 Gaming Boulevard, Digital City, 101010</span>
                    </li>
                  </ul>
                </div>
              </div>
            } />} />
            
            {/* Add other routes here */}
            <Route path="*" element={<div className="p-8 text-center"><h1 className="text-4xl font-bold mb-4">404</h1><p>Page not found</p></div>} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/developer/upload" element={<DeveloperUpload />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadGame />} />
            <Route path="games" element={<ManageGames />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="homepage" element={<HomepageControl />} />
            <Route path="support" element={<SupportChats />} />
            <Route path="ads" element={<AdsManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="p-8 text-center"><h1 className="text-4xl font-bold mb-4">404</h1><p>Admin Page not found</p></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
