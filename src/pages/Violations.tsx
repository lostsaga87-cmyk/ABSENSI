import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Violation } from '../types';
import { Plus, Search, Trash2 } from 'lucide-react';

export default function Violations() {
  const { students, violations, setViolations, currentUser } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Violation>>({
    date: new Date().toISOString().split('T')[0],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newViolation: Violation = {
      ...(formData as Violation),
      id: Math.random().toString(36).substr(2, 9),
      reportedBy: currentUser?.name || 'Sistem',
    };
    setViolations([newViolation, ...violations]);
    setIsModalOpen(false);
    setFormData({ date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus rekam pelanggaran ini?')) {
      setViolations(violations.filter(v => v.id !== id));
    }
  };

  const filteredViolations = violations.filter(v => {
    const student = students.find(s => s.id === v.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           v.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pelanggaran Siswa</h1>
          <p className="text-slate-500">Rekam dan pantau kedisiplinan serta pelanggaran siswa.</p>
        </div>
        <button 
          onClick={() => { setFormData({ date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 inline-flex items-center"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Catat Pelanggaran
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
        {/* Control Bar */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="relative rounded-md max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-slate-200 rounded-lg py-2 border shadow-sm"
              placeholder="Cari nama atau jenis pelanggaran..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                <th className="pb-4 px-2">Tanggal</th>
                <th className="pb-4 px-2">Siswa</th>
                <th className="pb-4 px-2">Kategori</th>
                <th className="pb-4 px-2">Deskripsi</th>
                <th className="pb-4 px-2 text-center">Poin</th>
                <th className="pb-4 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredViolations.length > 0 ? (
                filteredViolations.map((v, idx) => {
                  const student = students.find(s => s.id === v.studentId);
                  const isHeavy = v.points > 10;
                  return (
                    <tr key={v.id} className={`border-t border-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-4 px-2 text-slate-600">{v.date}</td>
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-900">{student?.name}</div>
                        <div className="text-xs text-slate-500">{student?.gradeClass}</div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${isHeavy ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {v.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-600">{v.description}</td>
                      <td className="py-4 px-2 text-center font-bold text-rose-600">-{v.points}</td>
                      <td className="py-4 px-2">
                        <div className="flex justify-center">
                          <button onClick={() => handleDelete(v.id)} className="text-rose-600 hover:text-rose-900 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500 italic">
                    Tidak ada data pelanggaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md mx-auto z-50 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 mt-10">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                Catat Pelanggaran Baru
              </h3>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal</label>
                <input required type="date" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select required className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.studentId || ''} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.gradeClass})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kategori Pelanggaran</label>
                <select required className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Keterlambatan">Keterlambatan</option>
                  <option value="Keributan">Keributan</option>
                  <option value="Kebersihan">Kebersihan</option>
                  <option value="Seragam">Seragam / Kerapian</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Poin Hukuman</label>
                <input required type="number" min="1" max="100" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.points || ''} onChange={e => setFormData({...formData, points: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Detail Deskripsi</label>
                <textarea required rows={3} className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="mt-8 flex flex-row-reverse gap-3 pb-2">
                <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                  Simpan
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-slate-200 px-4 py-2 bg-white text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
