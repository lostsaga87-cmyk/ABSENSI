import React, { useState } from 'react';
import { User, Save, Upload, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppData } from '../context/AppDataContext';

const subjects = [
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Bahasa Daerah',
  'IPA',
  'IPS',
  'MTK',
  'Informatika',
  'Seni Rupa',
  'Pendidikan Pancasila',
  'Pendidikan Agama dan Budi Pekerti',
  'BK',
  'BTQ',
  'PJOK'
];

const classes = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];

export default function Teachers() {
  const [isAdding, setIsAdding] = useState(true); // Default to add form view
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [homeroom, setHomeroom] = useState('');
  
  // Custom hook usage if we want to store it (mocking for now)
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !name) return;
    
    // In a real app we'd save to Supabase here
    // For now we just show success and reset
    console.log('Saved Teacher:', { nip, name, subjects: selectedSubjects, homeroom });
    
    // Mock save user to allow login
    const savedTeachers = JSON.parse(localStorage.getItem('mockTeachers') || '[]');
    savedTeachers.push({ nip, name, role: 'teacher' });
    localStorage.setItem('mockTeachers', JSON.stringify(savedTeachers));

    setSuccessMsg('Data guru berhasil disimpan! Guru dapat login dengan NIP sebagai username dan password.');
    setTimeout(() => setSuccessMsg(''), 5000);
    
    setNip('');
    setName('');
    setSelectedSubjects([]);
    setHomeroom('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Input Guru Baru</h1>
          <p className="text-slate-500">
            Tambahkan data pengajar baru ke dalam sistem
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg"
        >
          {isAdding ? 'Lihat Daftar Guru' : '+ Tambah Guru Baru'}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200">
          {successMsg}
        </div>
      )}

      {isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
          <form className="space-y-8" onSubmit={handleSave}>
            
            {/* Photo Upload Area */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 border-2 border-dashed border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors relative group overflow-hidden">
                <User className="w-10 h-10 group-hover:opacity-0 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium cursor-pointer hover:text-indigo-600">Upload Foto (Max 500KB)</span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">NIP (User ID)</label>
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
              <div className="border border-slate-200 rounded-xl p-5 sm:p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  {subjects.map(subject => (
                    <label key={subject} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Wali Kelas</label>
              <select 
                title="Wali Kelas" 
                value={homeroom}
                onChange={(e) => setHomeroom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white font-medium text-slate-600"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em 1.25em' }}
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <Save className="w-5 h-5" />
                Simpan Data Guru
              </button>
            </div>
            
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 text-center text-slate-500">
            Daftar guru akan tampil di sini.
          </div>
        </div>
      )}
    </div>
  );
}
