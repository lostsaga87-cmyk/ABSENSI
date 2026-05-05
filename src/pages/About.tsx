import React from 'react';
import { Info } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tentang Aplikasi</h1>
        <p className="text-slate-500">
          Informasi mengenai sistem EduManage
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg logo-shine-container flex items-center justify-center border border-slate-100 overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/d/1ezXCs_VCD_9IZwgWKjYT_i-OfXmeTW_I" 
            alt="SMPN 2 Sukorejo Logo" 
            className="w-16 h-16 object-contain drop-shadow-sm" 
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistem Manajemen Sekolah</h2>
          <h3 className="text-lg font-semibold text-indigo-600 mt-1">SMPN 2 SUKOREJO</h3>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          Aplikasi terintegrasi untuk mendukung kegiatan belajar mengajar, pengelolaan data kehadiran, pelanggaran, nilai, dan informasi pendukung lainnya guna mewujudkan digitalisasi sekolah yang efektif dan efisien.
        </p>

        <div className="border-t pt-4 text-xs text-slate-400">
          <p>Versi 1.0.0</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} SMPN 2 Sukorejo. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
