import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, CheckCircle, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ManageGames() {
  const [games, setGames] = useState<any[]>([]);
  const [previewGame, setPreviewGame] = useState<any | null>(null);

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
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
      } catch (error) {
        console.error("Error deleting game:", error);
        alert("Failed to delete game.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-text-main">Manage Games</h1>
          <p className="text-text-dim">View, approve, edit, or delete uploaded games.</p>
        </div>
        <Link 
          to="/admin/upload" 
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shrink-0 shadow-[0_0_15px_var(--primary-glow)]"
        >
          <Plus className="w-5 h-5" />
          Upload New Game
        </Link>
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
              {games.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-dim">No games found.</td>
                </tr>
              )}
              {games.map((game) => (
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
                {previewGame.uploadType === 'file' && previewGame.gameUrl?.includes('.apk') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-dim">
                    <p className="mb-4">This is an APK file and cannot be previewed in the browser.</p>
                    <a href={previewGame.gameUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary-color text-white rounded-xl font-bold hover:bg-primary-color/90 transition-colors">
                      Download APK to Test
                    </a>
                  </div>
                ) : previewGame.uploadType === 'file' && previewGame.gameUrl?.includes('.aab') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-dim">
                    <p className="mb-4">This is an AAB file and cannot be previewed in the browser.</p>
                    <a href={previewGame.gameUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary-color text-white rounded-xl font-bold hover:bg-primary-color/90 transition-colors">
                      Download AAB to Test
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
