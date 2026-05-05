import React from 'react';
import { X, Upload, Download } from 'lucide-react';

export default function ImportMasterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  const downloadTemplate = (type: 'guru' | 'tendik' | 'siswa') => {
    let content = '';
    let filename = '';

    if (type === 'guru') {
      content = `NIP;Nama Lengkap;Mata Pelajaran (Pisahkan dengan koma jika > 1);Wali Kelas (Opsional);Password\n198xxxx;Guru A;Matematika,IPA;Kelas 5;baujeng@1\n199xxxx;Guru B;Bahasa Indonesia;;baujeng@1`;
      filename = 'template_guru.csv';
    } else if (type === 'tendik') {
      content = `NIP;Nama Lengkap;Jabatan;Password\n198xxxx;Tendik A;Tata Usaha;baujeng@1\n199xxxx;Tendik B;Perpustakaan;baujeng@1`;
      filename = 'template_tendik.csv';
    } else if (type === 'siswa') {
      content = `NISN;NIS;Nama Lengkap;Kelas;Jenis Kelamin (L/P);Tanggal Lahir (YYYY-MM-DD);Password (Default: baujeng(kelas))\n1234567890;1001;Siswa A;Kelas 1;L;2017-05-20;baujeng1\n0987654321;1002;Siswa B;Kelas 1;P;2017-08-15;baujeng1`;
      filename = 'template_siswa.csv';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Import Master Database</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all">
              <span className="font-bold text-slate-800">Data Guru</span>
              <button 
                onClick={() => downloadTemplate('guru')}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all">
              <span className="font-bold text-slate-800">Data Tendik</span>
              <button 
                onClick={() => downloadTemplate('tendik')}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all">
              <span className="font-bold text-slate-800">Data Siswa</span>
              <button 
                onClick={() => downloadTemplate('siswa')}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-lg font-bold text-slate-700 mb-1 group-hover:text-indigo-700 transition-colors">Klik atau drag file CSV ke sini</p>
            <p className="text-sm text-slate-400">Format yang didukung: .csv, .xlsx</p>
          </div>

          <div className="flex justify-end pt-2">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 focus:outline-none active:scale-95">
              Upload Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
