import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, CheckCircle, XCircle, X, Save, Clock, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ManageGames() {
  const [games, setGames] = useState<any[]>([]);
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [editGame, setEditGame] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'games'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (gameId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'games', gameId), { status: newStatus });
      // alert(`Game status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleDelete = async (gameId: string) => {
    try {
      if(window.confirm("Are you sure you want to delete this game? This action is permanent!")) {
        await deleteDoc(doc(db, 'games', gameId));
        alert("Game successfully deleted!");
      }
    } catch (error: any) {
      console.error("Error deleting game:", error);
      alert(`Error deleting game: ${error.message || "You may not have correct permissions."}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGame) return;
    
    try {
      await updateDoc(doc(db, 'games', editGame.id), {
        title: editGame.title,
        description: editGame.description,
        category: editGame.category,
        thumbnail: editGame.thumbnail,
        gameUrl: editGame.gameUrl,
      });
      setEditGame(null);
    } catch (error: any) {
      console.error("Error updating game:", error);
      alert(`Error updating game: ${error.message}`);
    }
  };

  const filteredGames = games.filter(game => {
    if (activeTab !== 'all' && game.status !== activeTab) return false;
    
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchTitle = game.title?.toLowerCase().includes(qLower);
      const matchDev = game.developerName?.toLowerCase().includes(qLower);
      const matchTag = game.tags?.some((t: string) => t.toLowerCase().includes(qLower));
      if (!matchTitle && !matchDev && !matchTag) return false;
    }
    
    return true;
  });

  const pendingCount = games.filter(g => g.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-text-main flex items-center gap-3">
            Manage Games
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                {pendingCount} Pending Approval
              </span>
            )}
          </h1>
          <p className="text-text-dim">View, approve, edit, search or delete uploaded games.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <Link 
            to="/admin/upload" 
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shrink-0 shadow-[0_0_15px_var(--primary-glow)]"
          >
            <Plus className="w-5 h-5" />
            Upload New Game
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card-bg p-4 rounded-xl border border-border-color">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary-color text-white' : 'text-text-dim hover:text-white'}`}
          >
            All Games
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'text-text-dim hover:text-yellow-500'}`}
          >
            <Clock className="w-4 h-4" /> Pending
            {pendingCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'approved' ? 'bg-green-500 text-white' : 'text-text-dim hover:text-green-500'}`}
          >
            <Check className="w-4 h-4" /> Approved
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'text-text-dim hover:text-red-500'}`}
          >
            <X className="w-4 h-4" /> Rejected
          </button>
        </div>
        <div className="w-full sm:w-64">
           <input
             type="text"
             placeholder="Search by name, dev or tag..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full px-4 py-2 bg-bg-dark border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary-color"
           />
        </div>
      </div>

      <div className="bg-card-bg border border-border-color rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-dark text-text-dim text-sm">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-border-color">Game Title</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Developer</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Status</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Views</th>
                <th className="px-6 py-4 font-medium text-right border-b border-border-color">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredGames.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-dim">No games found in this category.</td>
                </tr>
              )}
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-semibold text-text-main">{game.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-dim">{game.developerName || 'Admin'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      game.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                      game.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      game.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {game.status?.toUpperCase() || 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-dim">{(game.views || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {game.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusChange(game.id, 'approved')} className="p-2 rounded-lg hover:bg-green-500/10 text-text-dim hover:text-green-500 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(game.id, 'rejected')} className="p-2 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-500 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setPreviewGame(game)} className="p-2 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors" title="Preview Game">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditGame(game)} className="p-2 rounded-lg hover:bg-white/10 text-text-dim hover:text-blue-500 transition-colors" title="Edit Game">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(game.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card-bg border border-border-color rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              <h3 className="text-xl font-bold text-text-main">Edit Game</h3>
              <button 
                onClick={() => setEditGame(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Title</label>
                <input 
                  type="text" 
                  value={editGame.title} 
                  onChange={(e) => setEditGame({...editGame, title: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Category</label>
                <select 
                  value={editGame.category} 
                  onChange={(e) => setEditGame({...editGame, category: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary-color transition-colors"
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
                <label className="block text-sm font-medium text-text-dim mb-1">Thumbnail URL</label>
                <input 
                  type="url" 
                  value={editGame.thumbnail} 
                  onChange={(e) => setEditGame({...editGame, thumbnail: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Game URL</label>
                <input 
                  type="url" 
                  value={editGame.gameUrl} 
                  onChange={(e) => setEditGame({...editGame, gameUrl: e.target.value})}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dim mb-1">Description</label>
                <textarea 
                  value={editGame.description} 
                  onChange={(e) => setEditGame({...editGame, description: e.target.value})}
                  rows={4}
                  className="w-full bg-bg-dark border border-border-color rounded-xl px-4 py-2 text-text-main focus:outline-none focus:border-primary-color transition-colors"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditGame(null)}
                  className="px-6 py-2 rounded-xl border border-border-color text-text-main font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-primary-color text-white font-medium flex items-center gap-2 hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)]"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card-bg border border-border-color rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              <h3 className="text-xl font-bold text-text-main">Preview: {previewGame.title}</h3>
              <button 
                onClick={() => setPreviewGame(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-bg-dark overflow-y-auto">
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-border-color">
                {((previewGame.uploadType === 'file' && (previewGame.gameUrl?.includes('.apk') || previewGame.gameUrl?.includes('.aab'))) || previewGame.gameUrl?.includes('.apk') || previewGame.gameUrl?.includes('.aab')) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-dim">
                    <p className="mb-4">This is a Mobile App file and cannot be previewed in the browser.</p>
                    <a href={previewGame.gameUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary-color text-white rounded-xl font-bold hover:bg-primary-color/90 transition-colors">
                      Download File to Test
                    </a>
                  </div>
                ) : (
                  <iframe 
                    src={previewGame.gameUrl || previewGame.url} 
                    className="w-full h-full border-0"
                    title="Game Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-dim mb-1">Description</h4>
                  <p className="text-text-main">{previewGame.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-text-dim mb-1">Category</h4>
                    <p className="text-text-main">{previewGame.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-dim mb-1">Developer</h4>
                    <p className="text-text-main">{previewGame.developerName}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border-color flex justify-end gap-3 bg-card-bg">
              {previewGame.status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      handleStatusChange(previewGame.id, 'rejected');
                      setPreviewGame(null);
                    }}
                    className="px-6 py-2 rounded-xl border border-red-500/50 text-red-500 font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusChange(previewGame.id, 'approved');
                      setPreviewGame(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
              <button 
                onClick={() => setPreviewGame(null)}
                className="px-6 py-2 rounded-xl bg-white/10 text-text-main font-medium hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
