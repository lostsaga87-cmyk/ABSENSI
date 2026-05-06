import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Grade } from '../types';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Grades() {
  const { students, grades, setGrades } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Grade>>({
    semester: 'Ganjil 2023/2024'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setGrades(grades.map(g => g.id === formData.id ? { ...g, ...formData } as Grade : g));
    } else {
      const newGrade: Grade = {
        ...(formData as Grade),
        id: Math.random().toString(36).substr(2, 9),
      };
      setGrades([newGrade, ...grades]);
    }
    setIsModalOpen(false);
    setFormData({ semester: 'Ganjil 2023/2024' });
  };

  const handleEdit = (grade: Grade) => {
    setFormData(grade);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus data nilai ini?')) {
      setGrades(grades.filter(g => g.id !== id));
    }
  };

  const filteredGrades = grades.filter(g => {
    const student = students.find(s => s.id === g.studentId);
    return String(student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           String(g.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Nilai Siswa</h1>
          <p className="text-slate-500">Kelola dan pantau evaluasi akademik siswa.</p>
        </div>
        <button 
          onClick={() => { setFormData({ semester: 'Ganjil 2023/2024' }); setIsModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 inline-flex items-center"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Input Nilai
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
              placeholder="Cari nama siswa atau mata pelajaran..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                <th className="pb-4 px-2">Siswa</th>
                <th className="pb-4 px-2">Mata Pelajaran</th>
                <th className="pb-4 px-2">Semester</th>
                <th className="pb-4 px-2 text-center">Nilai</th>
                <th className="pb-4 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((g, idx) => {
                  const student = students.find(s => s.id === g.studentId);
                  return (
                    <tr key={g.id} className={`border-t border-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-4 px-2">
                        <div className="font-bold text-slate-900">{student?.name}</div>
                        <div className="text-xs text-slate-500">{student?.gradeClass}</div>
                      </td>
                      <td className="py-4 px-2 font-medium text-slate-700">{g.subject}</td>
                      <td className="py-4 px-2 text-slate-600">{g.semester}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          g.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                          g.score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {g.score}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex justify-center space-x-3">
                          <button onClick={() => handleEdit(g)} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(g.id)} className="text-rose-600 hover:text-rose-900 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500 italic">
                    Belum ada data nilai tercatat.
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
                {formData.id ? 'Edit Nilai Siswa' : 'Input Nilai Baru'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select required className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.studentId || ''} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.gradeClass})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Contoh: Matematika" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nilai (0-100)</label>
                  <input required type="number" min="0" max="100" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.score || ''} onChange={e => setFormData({...formData, score: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.semester || ''} onChange={e => setFormData({...formData, semester: e.target.value})} />
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
