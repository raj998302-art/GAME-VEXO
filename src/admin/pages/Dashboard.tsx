import { useState, useEffect } from 'react';
import { Users, Gamepad2, Eye, Heart } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPlays: 0,
    totalUsers: 0,
    totalGames: 0,
    totalLikes: 0,
  });
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [topGames, setTopGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Fetch Games
        const gamesSnapshot = await getDocs(collection(db, 'games'));
        const totalGames = gamesSnapshot.size;
        
        let totalPlays = 0;
        let totalLikes = 0;
        
        gamesSnapshot.forEach(doc => {
          const data = doc.data();
          totalPlays += (data.views || 0);
          totalLikes += (data.likes || 0);
        });

        setStats({
          totalUsers,
          totalGames,
          totalPlays,
          totalLikes
        });

        // Fetch Recent Uploads
        const recentQ = query(collection(db, 'games'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentGames(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Top Games
        const topQ = query(collection(db, 'games'), where('status', '==', 'approved'), orderBy('views', 'desc'), limit(5));
        const topSnap = await getDocs(topQ);
        setTopGames(topSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const STATS_CARDS = [
    { label: 'Total Plays', value: stats.totalPlays.toLocaleString(), icon: Eye, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Games', value: stats.totalGames.toLocaleString(), icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: Heart, color: 'text-neon-pink', bg: 'bg-neon-pink/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main">Dashboard</h1>
        <p className="text-text-dim">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-text-dim">Loading dashboard data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_CARDS.map((stat) => (
              <div key={stat.label} className="bg-card-bg border border-border-color rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-text-dim text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-text-main">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card-bg border border-border-color rounded-[20px] p-6">
              <h2 className="text-xl font-bold mb-6 text-text-main">Recent Uploads</h2>
              <div className="space-y-4">
                {recentGames.length > 0 ? recentGames.map((game) => (
                  <div key={game.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} alt="Game" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-main">{game.title}</h4>
                      <p className="text-sm text-text-dim">{game.category} • {game.developerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      game.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                      game.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {game.status?.toUpperCase() || 'DRAFT'}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-text-dim">No recent uploads.</div>
                )}
              </div>
            </div>

            <div className="bg-card-bg border border-border-color rounded-[20px] p-6">
              <h2 className="text-xl font-bold mb-6 text-text-main">Top Performing Games</h2>
              <div className="space-y-4">
                {topGames.length > 0 ? topGames.map((game, idx) => (
                  <div key={game.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-8 text-center font-bold text-text-dim">#{idx + 1}</div>
                    <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} alt="Game" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-main">{game.title}</h4>
                      <p className="text-sm text-text-dim">{(game.views || 0).toLocaleString()} Views</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-text-dim">No top games yet.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
