import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';

export default function ImportMasterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'guru' | 'tendik' | 'siswa'>('guru');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = (type: 'guru' | 'tendik' | 'siswa') => {
    let content = '';
    let filename = '';

    if (type === 'guru') {
      content = `NIP;NAMA LENGKAP;MATA PELAJARAN;WALI KELAS(OPSIONAL);PASSWORD\n198xxxx;Guru A;Matematika,IPA;Kelas 5;baujeng@1\n199xxxx;Guru B;Bahasa Indonesia;;baujeng@1`;
      filename = 'template_guru.csv';
    } else if (type === 'tendik') {
      content = `NIP;NAMA LENGKAP;MATA PELAJARAN;WALI KELAS(OPSIONAL);PASSWORD\n198xxxx;Tendik A;;;baujeng@1\n199xxxx;Tendik B;;;baujeng@1`;
      filename = 'template_tendik.csv';
    } else if (type === 'siswa') {
      content = `NISN;NIS;NAMA LENGKAP;KELAS;JENIS KELAMIN;TANGGAL LAHIR;PASSWORD\n1234567890;1001;Siswa A;Kelas 1;L;2017-05-20;baujeng1\n0987654321;1002;Siswa B;Kelas 1;P;2017-08-15;baujeng1`;
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        alert('Format file tidak didukung. Harap upload file .csv atau .xlsx');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          if (data.length === 0) throw new Error("File CSV kosong.");

          // Validasi header
          const headers = Object.keys(data[0]).map(h => h.trim().toUpperCase());
          let isValid = false;
          
          if (importType === 'guru' || importType === 'tendik') {
            isValid = headers.includes('NIP') && headers.includes('NAMA LENGKAP') && headers.includes('PASSWORD');
          } else {
            isValid = headers.includes('NISN') && headers.includes('NIS') && headers.includes('NAMA LENGKAP') && headers.includes('PASSWORD');
          }

          if (!isValid) {
            throw new Error(`Format header CSV tidak sesuai untuk tipe ${importType}.`);
          }

          let successCount = 0;

          for (const row of data) {
            // Trim whitespace on all keys and filter out empty
            const cleanRow: any = {};
            for (const key in row) {
               cleanRow[key.trim().toUpperCase()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }

            const password = cleanRow['PASSWORD'];
            const name = cleanRow['NAMA LENGKAP'];
            
            if (importType === 'guru' || importType === 'tendik') {
              const nip = cleanRow['NIP'];
              if (!nip || !password || !name) continue; // Skip invalid records

              // Insert to users table first
              const { data: user, error: userError } = await supabase.from('users').insert({
                username: nip,
                password_hash: password, // As requested
                role: importType === 'guru' ? 'teacher' : 'tendik',
                name: name
              }).select('id').single();

              if (userError) throw userError;

              // Insert to guru/tendik table
              const tableData = {
                user_id: user.id,
                nip: nip,
                nama_lengkap: name,
                mata_pelajaran: cleanRow['MATA PELAJARAN'] || null,
                wali_kelas: cleanRow['WALI KELAS(OPSIONAL)'] || null
              };

              const { error: staffError } = await supabase.from(importType).insert(tableData);
              if (staffError) throw staffError;
              
              successCount++;
            } else {
              // Siswa
              const nisn = cleanRow['NISN'];
              const nis = cleanRow['NIS'];
              const className = cleanRow['KELAS'];
              
              if (!nis || !password || !name) continue;

              const { data: user, error: userError } = await supabase.from('users').insert({
                username: nis,
                password_hash: password, 
                role: 'student',
                name: name
              }).select('id').single();

              if (userError) throw userError;

              const gender = cleanRow['JENIS KELAMIN'];
              const validGender = (gender === 'L' || gender === 'P') ? gender : null;

              const tableData = {
                user_id: user.id,
                nisn: nisn || null,
                nis: nis,
                name: name,
                class_name: className || '-',
                gender: validGender,
                birth_date: cleanRow['TANGGAL LAHIR'] || null
              };

              const { error: studentError } = await supabase.from('students').insert(tableData);
              if (studentError) throw studentError;

              successCount++;
            }
          }

          if (successCount === 0) {
            throw new Error("Tidak ada data yang berhasil diimport. Pastikan format isian benar.");
          }

          setUploadSuccess(true);
          setIsUploading(false);
          
          setTimeout(() => {
            setUploadSuccess(false);
            setSelectedFile(null);
            onClose();
          }, 3000);

        } catch (error: any) {
          console.error("Import Error:", error);
          setUploadError(error.message || "Terjadi kesalahan saat memproses data.");
          setIsUploading(false);
        }
      },
      error: (err) => {
        setUploadError(`Gagal membaca file: ${err.message}`);
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Import Master Database</h2>
          <button onClick={() => {
            onClose();
            setSelectedFile(null); // Reset when closing
          }} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all cursor-pointer ${importType === 'guru' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'}`} onClick={() => setImportType('guru')}>
              <span className="font-bold text-slate-800">Data Guru</span>
              <button 
                onClick={(e) => { e.stopPropagation(); downloadTemplate('guru'); }}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
            
            <div className={`border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all cursor-pointer ${importType === 'tendik' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'}`} onClick={() => setImportType('tendik')}>
              <span className="font-bold text-slate-800">Data Tendik</span>
              <button 
                onClick={(e) => { e.stopPropagation(); downloadTemplate('tendik'); }}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>

            <div className={`border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all cursor-pointer ${importType === 'siswa' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-200 hover:shadow-md'}`} onClick={() => setImportType('siswa')}>
              <span className="font-bold text-slate-800">Data Siswa</span>
              <button 
                onClick={(e) => { e.stopPropagation(); downloadTemplate('siswa'); }}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
          </div>

          <div 
            className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isDragging ? 'bg-indigo-50 border-indigo-500' : 'border-slate-300 hover:bg-slate-50 hover:border-indigo-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.xlsx" 
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-slate-700 mb-1">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="mt-4 text-sm text-rose-500 hover:text-rose-700 font-medium z-10"
                >
                  Hapus File
                </button>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                  <Upload className="w-8 h-8" />
                </div>
                <p className={`text-lg font-bold mb-1 transition-colors ${isDragging ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-700'}`}>Klik atau drag file CSV ke sini</p>
                <p className="text-sm text-slate-400">Format yang didukung: .csv, .xlsx</p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-center font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200 text-center font-medium">
              File {selectedFile?.name} berhasil diproses dan disimpan ke Supabase!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleUpload}
              disabled={isUploading || !selectedFile || uploadSuccess}
              className={`font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 focus:outline-none active:scale-95 ${
                isUploading || !selectedFile || uploadSuccess
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
              }`}
            >
              {isUploading ? 'Memproses...' : uploadSuccess ? 'Berhasil' : 'Upload Database'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
