import React, { useState, useEffect } from 'react';
import { User, Save, Upload, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppData } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';

const subjectsList = [
  'Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Daerah', 'IPA', 'IPS', 'MTK',
  'Informatika', 'Seni Rupa', 'Pendidikan Pancasila', 'Pendidikan Agama dan Budi Pekerti',
  'BK', 'BTQ', 'PJOK'
];

const classes = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];

interface Guru {
  id: string;
  nip: string;
  nama_lengkap: string;
  mata_pelajaran: string;
  wali_kelas: string | null;
  created_at?: string;
}

export default function Teachers() {
  const [isAdding, setIsAdding] = useState(false);
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [homeroom, setHomeroom] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('guru').select('*').order('nama_lengkap');
    if (data && !error) {
      setTeachers(data);
    } else if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !name) return;
    
    // Create User record for auth logic
    const { error: userError } = await supabase.from('users').insert({
      username: nip,
      password_hash: nip, // simple default password
      role: 'teacher',
      name: name
    });

    if (userError) {
      console.error(userError);
    }

    // Insert Guru record
    const { error } = await supabase.from('guru').insert({
      nip: nip,
      nama_lengkap: name,
      mata_pelajaran: selectedSubjects.join(', '),
      wali_kelas: homeroom || null
    });

    if (!error) {
      setSuccessMsg('Data guru berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setNip('');
      setName('');
      setSelectedSubjects([]);
      setHomeroom('');
      fetchTeachers();
      setIsAdding(false);
    } else {
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDelete = async (nipId: string) => {
    if (window.confirm('Yakin ingin menghapus guru ini?')) {
      await supabase.from('guru').delete().eq('nip', nipId);
      await supabase.from('users').delete().eq('username', nipId);
      fetchTeachers();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Guru</h1>
          <p className="text-slate-500">
            Kelola data pengajar dan akses sistem
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
        >
          {isAdding ? 'Lihat Daftar Guru' : <><Plus className="w-4 h-4"/> Tambah Guru Baru</>}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200 font-medium">
          {successMsg}
        </div>
      )}

      {isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
          <form className="space-y-8" onSubmit={handleSave}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">NIP (Username Login)</label>
                <input 
                  type="text" 
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  placeholder="Contoh: 1985xxxx" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                  placeholder="Nama Lengkap dengan Gelar" 
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Mata Pelajaran Diampu</label>
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                  {subjectsList.map(subject => (
                    <label key={subject} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center shrink-0">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-[5px] checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors cursor-pointer"
                          checked={selectedSubjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors select-none">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Homeroom */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Wali Kelas (Opsional)</label>
              <select 
                value={homeroom}
                onChange={(e) => setHomeroom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-700 text-sm"
              >
                <option value="">-- Bukan Wali Kelas --</option>
                {classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95 text-sm"
              >
                <Save className="w-5 h-5" />
                Simpan Data Guru
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">NIP</th>
                  <th className="py-4 px-6 font-semibold">Nama Guru</th>
                  <th className="py-4 px-6 font-semibold">Mata Pelajaran</th>
                  <th className="py-4 px-6 font-semibold">Wali Kelas</th>
                  <th className="py-4 px-6 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : teachers.length > 0 ? (
                  teachers.map((guru) => (
                    <tr key={guru.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-4 px-6 font-medium text-slate-900">{guru.nip}</td>
                      <td className="py-4 px-6 text-slate-700">{guru.nama_lengkap}</td>
                      <td className="py-4 px-6 text-slate-600 text-sm max-w-[200px] truncate">{guru.mata_pelajaran || '-'}</td>
                      <td className="py-4 px-6">
                        {guru.wali_kelas ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {guru.wali_kelas}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDelete(guru.nip)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <p>Belum ada data guru.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
