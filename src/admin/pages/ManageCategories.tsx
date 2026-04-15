import { useState } from 'react';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Action', slug: 'action', theme: 'default', count: 124, status: 'Active' },
  { id: '2', name: 'Racing', slug: 'racing', theme: 'theme-neon', count: 86, status: 'Active' },
  { id: '3', name: 'Puzzle', slug: 'puzzle', theme: 'default', count: 210, status: 'Active' },
  { id: '4', name: 'Arcade', slug: 'arcade', theme: 'theme-retro', count: 342, status: 'Active' },
  { id: '5', name: 'Kids', slug: 'kids', theme: 'theme-kids', count: 56, status: 'Active' },
  { id: '6', name: 'Horror', slug: 'horror', theme: 'theme-horror', count: 92, status: 'Active' },
];

export default function ManageCategories() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-400">Manage game categories and their themes.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shrink-0">
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium w-12"></th>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Theme</th>
                <th className="px-6 py-4 font-medium">Games</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {MOCK_CATEGORIES.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-500 cursor-move">
                    <GripVertical className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/${cat.slug}/100/100`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium border border-dark-border">
                      {cat.theme}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{cat.count}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
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
