import React, { useState, useEffect } from 'react';
import { Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { setSupabaseClient } from '../lib/supabase';

export default function ApiConfig() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Load from local storage
    const url = localStorage.getItem('SUPABASE_URL') || '';
    const anonKey = localStorage.getItem('SUPABASE_ANON_KEY') || '';
    
    setSupabaseUrl(url);
    setSupabaseAnonKey(anonKey);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (supabaseUrl && supabaseAnonKey) {
      localStorage.setItem('SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey.trim());
      
      // Update running client
      setSupabaseClient(supabaseUrl.trim(), supabaseAnonKey.trim());
      
      setMessage({ type: 'success', text: 'Konfigurasi API Supabase berhasil disimpan! Kredensial akan langsung digunakan.' });
    } else {
      setMessage({ type: 'error', text: 'Harap lengkapi kedua kunci API Supabase.' });
    }
  };

  const handleClear = () => {
    if (window.confirm('Yakin ingin reset konfigurasi? Ini akan mengembalikan ke pengaturan default system.')) {
      localStorage.removeItem('SUPABASE_URL');
      localStorage.removeItem('SUPABASE_ANON_KEY');
      setSupabaseUrl('');
      setSupabaseAnonKey('');
      
      // Request page reload to re-init with default env variables
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Konfigurasi API</h1>
        <p className="text-slate-500">
          Atur koneksi Supabase untuk Master Database. Konfigurasi yang Anda simpan di sini akan digunakan saat memproses atau menampilkan data.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              Supabase Credentials
            </h3>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 text-sm">
              <p className="font-semibold mb-1">Informasi:</p>
              <p>Mendapatkan error "Invalid API key" saat Import Data Database? Anda perlu mengisi kredensial Supabase Project Anda di sini.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Supabase Project URL</label>
              <input
                type="url"
                required
                placeholder="https://xxxxxx.supabase.co"
                className="w-full border-slate-200 rounded-xl py-3 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Supabase Anon Key</label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full border-slate-200 rounded-xl py-3 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 font-medium py-2 px-4 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Reset ke Default
            </button>
            
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Simpan Konfigurasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
