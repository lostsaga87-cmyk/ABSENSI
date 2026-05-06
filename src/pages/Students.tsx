import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Student } from '../types';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    let allData: Student[] = [];
    let page = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true })
        .range(page * limit, (page + 1) * limit - 1);
      
      if (error) {
        console.error('Error fetching students:', error);
        break;
      }
      
      if (data) {
        allData = [...allData, ...data];
        if (data.length < limit) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    }
    
    setStudents(allData);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      const { error } = await supabase
        .from('students')
        .update({
          nis: formData.nis,
          nisn: formData.nisn,
          name: formData.name,
          class_name: formData.class_name,
          gender: formData.gender,
          birth_date: formData.birth_date,
        })
        .eq('id', formData.id);
      
      if (!error) {
        fetchStudents();
        setIsModalOpen(false);
        setFormData({});
      } else {
        alert('Gagal mengupdate: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('students')
        .insert([{
          nis: formData.nis,
          nisn: formData.nisn,
          name: formData.name,
          class_name: formData.class_name,
          gender: formData.gender,
          birth_date: formData.birth_date,
        }]);
      
      if (!error) {
        fetchStudents();
        setIsModalOpen(false);
        setFormData({});
      } else {
        alert('Gagal menyimpan: ' + error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus data siswa ini?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  let filteredStudents = students.filter(s => 
    String(s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(s.nis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nisn && String(s.nisn).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortConfig !== null) {
    filteredStudents.sort((a, b) => {
      // @ts-ignore - dynamic key
      const aVal = a[sortConfig.key] || '';
      // @ts-ignore - dynamic key
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: keyof Student) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-500">Kelola seluruh data informasi siswa.</p>
        </div>
        <button 
          onClick={() => { setFormData({}); setIsModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 inline-flex items-center"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Tambah Siswa
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
              placeholder="Cari nama, NIS, atau NISN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('name')}>Nama {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('nisn')}>NISN {sortConfig?.key === 'nisn' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('nis')}>NIS {sortConfig?.key === 'nis' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('class_name')}>Kelas {sortConfig?.key === 'class_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('gender')}>L/P {sortConfig?.key === 'gender' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('birth_date')}>Tanggal Lahir {sortConfig?.key === 'birth_date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="pb-4 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                 <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    Memuat data...
                  </td>
                 </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, idx) => (
                  <tr key={student.id} className={`border-t border-slate-50 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="py-4 px-2 font-bold text-slate-900">{student.name}</td>
                    <td className="py-4 px-2 text-slate-600">{student.nisn || '-'}</td>
                    <td className="py-4 px-2 text-slate-600">{student.nis}</td>
                    <td className="py-4 px-2 text-slate-600">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
                        {student.class_name}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-600 font-medium">{student.gender || '-'}</td>
                    <td className="py-4 px-2 text-slate-600">{student.birth_date || '-'}</td>
                    <td className="py-4 px-2">
                      <div className="flex justify-center space-x-3">
                        <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="text-rose-600 hover:text-rose-900 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-slate-500 italic">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Tampilan:</span>
              <select 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm w-16 border-slate-200 rounded-lg py-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md mx-auto z-50 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 mt-10">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {formData.id ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">NISN</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.nisn || ''} onChange={e => setFormData({...formData, nisn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">NIS</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.nis || ''} onChange={e => setFormData({...formData, nis: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kelas</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Contoh: X-A" value={formData.class_name || ''} onChange={e => setFormData({...formData, class_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value as 'L'|'P'})}>
                    <option value="">Pilih</option>
                    <option value="L">L</option>
                    <option value="P">P</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.birth_date || ''} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
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
