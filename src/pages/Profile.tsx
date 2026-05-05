import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { User, KeyRound } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useAppData();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil Pengguna</h1>
        <p className="text-slate-500">
          Kelola informasi profil dan kredensial akses
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg shrink-0">
            <span className="text-3xl font-bold text-slate-700">{currentUser?.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{currentUser?.name}</h2>
            <p className="text-slate-500 capitalize">{currentUser?.role}</p>
          </div>
        </div>

        {currentUser?.role === 'admin' ? (
          <form className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Ubah Data Login</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Username Baru
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Password Lama
              </label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4" 
              />
              
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <button type="button" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Simpan Perubahan
            </button>
          </form>
        ) : (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">ID Pengguna (Username)</label>
              <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                {currentUser?.username}
              </div>
            </div>
            <p className="text-xs text-slate-400">Hubungi Administrator jika Anda ingin mengubah informasi profil.</p>

            <div className="pt-6 mt-4 border-t border-slate-100">
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
