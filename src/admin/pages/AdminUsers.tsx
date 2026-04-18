import React, { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Search, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
        await updateDoc(doc(db, 'users', userId), { role: newRole });
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      alert(`Error updating role: ${error.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        await deleteDoc(doc(db, 'users', userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-text-main">Manage Users</h1>
          <p className="text-text-dim">View registered users, change roles, and manage access.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card-bg border border-border-color rounded-[20px] p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-text-dim" />
          </div>
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-dark border border-border-color rounded-xl pl-11 pr-4 py-3 text-text-main focus:outline-none focus:border-primary-color transition-colors"
          />
        </div>
      </div>

      <div className="bg-card-bg border border-border-color rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left line-clamp-1">
            <thead className="bg-bg-dark text-text-dim text-sm whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-border-color">User</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Email</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Role</th>
                <th className="px-6 py-4 font-medium border-b border-border-color">Stats</th>
                <th className="px-6 py-4 font-medium text-right border-b border-border-color">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-dim">No users found.</td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-color/20 text-primary-color flex items-center justify-center font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-semibold text-text-main">{user.displayName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-dim">{user.email || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-primary-color/20 text-primary-color' : 
                      user.role === 'banned' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {(user.role || 'user').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-dim text-sm">
                    <p>XP: {user.score || 0}</p>
                    <p>Games: {user.gamesPlayed || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       {user.role !== 'admin' ? (
                          <button onClick={() => handleRoleChange(user.id, 'admin')} className="p-2 rounded-lg hover:bg-primary-color/10 text-text-dim hover:text-primary-color transition-colors" title="Make Admin">
                            <Shield className="w-4 h-4" />
                          </button>
                       ) : (
                          <button onClick={() => handleRoleChange(user.id, 'user')} className="p-2 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors" title="Remove Admin">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                       )}
                       
                       {user.role !== 'banned' && user.role !== 'admin' ? (
                         <button onClick={() => handleRoleChange(user.id, 'banned')} className="p-2 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-500 transition-colors" title="Ban User">
                            <Ban className="w-4 h-4" />
                         </button>
                       ) : user.role === 'banned' ? (
                         <button onClick={() => handleRoleChange(user.id, 'user')} className="p-2 rounded-lg hover:bg-green-500/10 text-text-dim hover:text-green-500 transition-colors" title="Unban User">
                            <CheckCircle className="w-4 h-4" />
                         </button>
                       ) : null}
                       
                       <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-dim hover:text-red-500 transition-colors" title="Delete User">
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
    </div>
  );
}
