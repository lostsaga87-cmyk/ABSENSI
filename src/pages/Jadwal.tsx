import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Guru {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  guru_id: string;
  guru_name: string;
  class_name: string;
  day: string;
  period: string;
  subject: string;
  role: string;
}

const CLASSES = [
  'VII A', 'VII B', 'VII C', 'VII D', 'VII E', 'VII F',
  'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E', 'VIII F'
];

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface JadwalProps {
  onClose: () => void;
}

export default function Jadwal({ onClose }: JadwalProps) {
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterTeacher, setFilterTeacher] = useState<string>('Semua Guru');
  const [filterClass, setFilterClass] = useState<string>(CLASSES[0]);
  const [filterDay, setFilterDay] = useState<string>(DAYS[0]);

  // Modal Setup
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupForm, setSetupForm] = useState<Partial<Schedule>>({
    class_name: CLASSES[0],
    day: DAYS[0],
    period: '1',
    subject: '',
    role: 'Guru Mapel'
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    // Attempt to fetch from 'guru' table
    const { data, error } = await supabase.from('guru').select('id, name').order('name');
    if (!error && data) {
      setTeachers(data);
    } else {
      console.error(error);
      // fallback to users table if guru doesn't have name
      const { data: users, error: userError } = await supabase.from('users').select('id, name').eq('role', 'teacher').order('name');
      if (!userError && users) {
        setTeachers(users);
      }
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    let query = supabase.from('schedules').select('*')
      .eq('class_name', filterClass)
      .eq('day', filterDay);
      
    if (filterTeacher !== 'Semua Guru') {
      query = query.eq('guru_id', filterTeacher);
    }

    const { data, error } = await query.order('period');
    
    if (!error && data) {
      setSchedules(data);
    } else {
      console.error(error);
      setSchedules([]);
    }
    setLoading(false);
  };

  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const guru = teachers.find(t => t.id === setupForm.guru_id);
    if (!guru) return alert('Silakan pilih guru');

    const { error } = await supabase.from('schedules').insert([{
      guru_id: guru.id,
      guru_name: guru.name,
      class_name: setupForm.class_name,
      day: setupForm.day,
      period: setupForm.period,
      subject: setupForm.subject,
      role: setupForm.role
    }]);

    if (!error) {
      setIsSetupOpen(false);
      fetchSchedules(); // refresh
      alert('Jadwal berhasil disimpan!');
    } else {
      alert('Gagal menyimpan jadwal: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus jadwal ini?')) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) {
        fetchSchedules();
      } else {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 md:p-12 overflow-y-auto w-full h-full flex items-start justify-center">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[80vh] my-auto">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Jadwal Pelajaran</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6 bg-slate-50/50">
          {/* Action button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="px-5 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Setup Jadwal
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Guru</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 bg-white"
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                >
                  <option value="Semua Guru">Semua Guru</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 bg-white"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  {CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hari</label>
                <select 
                  className="w-full border-slate-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 bg-white"
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
               <button 
                  onClick={fetchSchedules}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md transition-colors w-full sm:w-auto"
                >
                  Tampilkan
                </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-slate-600 text-xs font-bold uppercase">
                    <th className="py-4 px-6">Jam Ke</th>
                    <th className="py-4 px-6">Mata Pelajaran</th>
                    <th className="py-4 px-6">Guru</th>
                    <th className="py-4 px-6">Peran</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-slate-500">Memuat data...</td>
                    </tr>
                  ) : schedules.length > 0 ? (
                    schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-6 font-bold text-slate-500">#{schedule.period}</td>
                        <td className="py-4 px-6 font-medium text-slate-900">{schedule.subject}</td>
                        <td className="py-4 px-6 text-slate-700">{schedule.guru_name}</td>
                        <td className="py-4 px-6 text-slate-700">{schedule.role}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center space-x-3">
                            <button onClick={() => handleDelete(schedule.id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-4 px-6 font-bold text-slate-400">#{i + 1}</td>
                        <td className="py-4 px-6 text-slate-400">-</td>
                        <td className="py-4 px-6 text-slate-400">-</td>
                        <td className="py-4 px-6 text-slate-400">-</td>
                        <td className="py-4 px-6"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Setup Jadwal</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSetup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Guru</label>
                <select 
                  required
                  className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                  value={setupForm.guru_id || ''}
                  onChange={e => setSetupForm({...setupForm, guru_id: e.target.value})}
                >
                  <option value="">Pilih Guru...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kelas</label>
                  <select 
                    required
                    className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                    value={setupForm.class_name}
                    onChange={e => setSetupForm({...setupForm, class_name: e.target.value})}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Hari</label>
                  <select 
                    required
                    className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                    value={setupForm.day}
                    onChange={e => setSetupForm({...setupForm, day: e.target.value})}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jam Ke</label>
                  <input 
                    type="number" 
                    min="1" max="10" 
                    required
                    className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                    value={setupForm.period}
                    onChange={e => setSetupForm({...setupForm, period: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Peran</label>
                   <select 
                    required
                    className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                    value={setupForm.role}
                    onChange={e => setSetupForm({...setupForm, role: e.target.value})}
                  >
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Guru Piket">Guru Piket</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Matematika"
                  className="w-full border-slate-200 rounded-lg py-2 px-3 shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500 text-sm"
                  value={setupForm.subject}
                  onChange={e => setSetupForm({...setupForm, subject: e.target.value})}
                />
              </div>

              <div className="mt-8 flex flex-row-reverse gap-3 pb-2 pt-4">
                <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-fuchsia-600 text-sm font-bold text-white shadow-md hover:bg-fuchsia-700 focus:outline-none transition-colors">
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
