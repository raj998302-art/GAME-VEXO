import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/SEO';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('score', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          username: doc.data().username || doc.data().displayName || 'Anonymous',
          score: doc.data().score || 0,
          gamesPlayed: doc.data().gamesPlayed || 0,
          avatar: doc.data().photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`,
          trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend for now
        }));
        
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <SEO 
        title="Global Leaderboard | GameVexo" 
        description="Check out the top players on GameVexo. Compete, earn points, and climb the ranks!"
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-500 mb-2 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Global Leaderboard</h1>
          <p className="text-text-dim max-w-2xl mx-auto">
            The elite players of GameVexo. Play games, earn points, and secure your spot at the top.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-text-dim">Loading leaderboard...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-[20px] border border-border-color">
            <p className="text-text-dim">No players found yet. Be the first to play!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboardData.length >= 3 && (
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-8 pb-12">
                {/* Rank 2 */}
                <div className="flex flex-col items-center order-2 md:order-1">
                  <div className="relative mb-4">
                    <img src={leaderboardData[1].avatar} alt="Avatar" className="w-20 h-20 rounded-full bg-card-bg border-4 border-gray-400 object-cover" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold border-2 border-bg-dark">2</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-text-main">{leaderboardData[1].username}</div>
                    <div className="text-primary-color font-mono font-medium">{leaderboardData[1].score.toLocaleString()} pts</div>
                  </div>
                  <div className="w-24 h-32 bg-gradient-to-t from-card-bg to-transparent mt-4 rounded-t-xl border-t border-gray-400/30"></div>
                </div>

                {/* Rank 1 */}
                <div className="flex flex-col items-center order-1 md:order-2 z-10">
                  <div className="relative mb-4">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500">
                      <Star className="w-8 h-8 fill-current drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                    </div>
                    <img src={leaderboardData[0].avatar} alt="Avatar" className="w-28 h-28 rounded-full bg-card-bg border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] object-cover" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-lg border-4 border-bg-dark">1</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-text-main text-lg">{leaderboardData[0].username}</div>
                    <div className="text-yellow-500 font-mono font-bold text-xl">{leaderboardData[0].score.toLocaleString()} pts</div>
                  </div>
                  <div className="w-32 h-40 bg-gradient-to-t from-yellow-500/20 to-transparent mt-4 rounded-t-xl border-t-2 border-yellow-500/50"></div>
                </div>

                {/* Rank 3 */}
                <div className="flex flex-col items-center order-3">
                  <div className="relative mb-4">
                    <img src={leaderboardData[2].avatar} alt="Avatar" className="w-20 h-20 rounded-full bg-card-bg border-4 border-orange-600 object-cover" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold border-2 border-bg-dark">3</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-text-main">{leaderboardData[2].username}</div>
                    <div className="text-primary-color font-mono font-medium">{leaderboardData[2].score.toLocaleString()} pts</div>
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-t from-card-bg to-transparent mt-4 rounded-t-xl border-t border-orange-600/30"></div>
                </div>
              </div>
            )}

            {/* Leaderboard List */}
            <div className="glass-panel rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#09090b] text-text-dim text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium border-b border-border-color w-20 text-center">Rank</th>
                      <th className="px-6 py-4 font-medium border-b border-border-color">Player</th>
                      <th className="px-6 py-4 font-medium border-b border-border-color text-right">Score</th>
                      <th className="px-6 py-4 font-medium border-b border-border-color text-right hidden sm:table-cell">Games Played</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {leaderboardData.slice(3).map((player) => (
                      <tr key={player.rank} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-dim font-bold group-hover:text-text-main transition-colors">{player.rank}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={player.avatar} alt="" className="w-10 h-10 rounded-full bg-card-bg object-cover" />
                            <span className="font-semibold text-text-main">{player.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-primary-color font-mono font-bold">{player.score.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-text-dim hidden sm:table-cell">
                          {player.gamesPlayed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
