import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Users, AlertTriangle, CalendarCheck, GraduationCap, MapPin, UserPlus, Clock, Target, Database, Keyboard, Calendar, UserCog, Megaphone, Key, HelpCircle, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import ImportMasterModal from '../components/ImportMasterModal';

export default function Dashboard() {
  const { students, violations, currentUser } = useAppData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  type Shortcut = {
    title: string;
    sub: string;
    icon: React.ElementType;
    color: string;
    path?: string;
    onClick?: () => void;
  };

  const adminShortcuts: Shortcut[] = [
    { title: 'Mapping Ekskul', sub: 'Aktivitas', icon: Target, color: 'bg-fuchsia-600 text-white', path: '/ekskul' },
    { title: 'Import Master', sub: 'Database CSV', icon: Database, color: 'bg-rose-500 text-white', onClick: () => setIsImportModalOpen(true) },
    { title: 'Input Manual', sub: 'Input Massal CSV', icon: Keyboard, color: 'bg-purple-600 text-white', path: '/input-manual' },
    { title: 'Jadwal Pelajaran', sub: 'Setup Jadwal', icon: Calendar, color: 'bg-fuchsia-500 text-white', path: '/jadwal' },
    { title: 'Manajemen User', sub: 'Akun Guru', icon: UserCog, color: 'bg-emerald-500 text-white', path: '/teachers' }, 
    { title: 'Data Murid', sub: 'Siswa & Mutasi', icon: GraduationCap, color: 'bg-blue-500 text-white', path: '/students' }, 
    { title: 'Pengumuman', sub: 'Info Publik', icon: Megaphone, color: 'bg-orange-500 text-white', path: '/pengumuman' },
    { title: 'Konfigurasi API', sub: 'Chatbot & Integrasi', icon: Key, color: 'bg-indigo-500 text-white', path: '/api-config' },
    { title: 'Pusat Bantuan', sub: 'Info & Kontak', icon: HelpCircle, color: 'bg-blue-600 text-white', path: '/help' },
    { title: 'Pengaturan', sub: 'Konfigurasi Umum', icon: Settings, color: 'bg-slate-700 text-white', path: '/settings' },
    { title: 'Geofencing', sub: 'Lokasi Absen', icon: MapPin, color: 'bg-teal-500 text-white', path: '/geofencing' },
  ];

  // Dummy data for realtime teacher activities
  const activeTeachers = [
    { id: 1, name: 'Bapak Budi', subject: 'Matematika', class: '9A', status: 'Mengajar', time: '08:00 - 09:30', room: 'Ruang 9A' },
    { id: 2, name: 'Ibu Siti', subject: 'Bahasa Indonesia', class: '8B', status: 'Mengajar', time: '08:00 - 09:30', room: 'Ruang 8B' },
    { id: 3, name: 'Bapak Joko', subject: 'IPA', class: '7C', status: 'Standby', time: '-', room: 'Ruang Guru' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {currentUser?.role === 'admin' ? 'Dasbor Admin' : 
             currentUser?.role === 'teacher' ? 'Dasbor Guru' : 
             currentUser?.role === 'tendik' ? 'Dasbor Tendik' :
             currentUser?.role === 'student' ? 'Dasbor Siswa' : 'Dasbor Monitoring'}
          </h1>
          <p className="text-slate-500">
            Selamat datang kembali, {currentUser?.name}. Berikut ringkasan data sekolah saat ini.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50">Laporan PDF</button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 flex-1 auto-rows-min">
        {/* Total Siswa */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" /> Total Siswa
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">{students.length}</span>
            <span className="text-xs font-bold text-emerald-500">Aktif</span>
          </div>
        </div>

        {/* Pelanggaran */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Pelanggaran bln ini
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-rose-600">{violations.length}</span>
            <span className="text-xs font-bold text-rose-400">Kasus</span>
          </div>
        </div>

        {/* Kehadiran */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> Rata-rata Kehadiran
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">95%</span>
            <span className="text-xs font-bold text-slate-500">Normal</span>
          </div>
        </div>

        {/* Nilai */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-indigo-900 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-white h-32">
          <span className="text-xs font-bold opacity-60 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Rata-rata Nilai
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">82.5</span>
            <span className="text-xs font-bold text-indigo-300">Target: 80.0</span>
          </div>
        </div>

        {/* Admin Specific Shortcuts */}
        {currentUser?.role === 'admin' && (
          <div className="col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
            {adminShortcuts.map((shortcut, idx) => {
              const Icon = shortcut.icon;
              const content = (
                <>
                  <div className={cn("p-4 rounded-3xl shadow-sm", shortcut.color)}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{shortcut.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{shortcut.sub}</span>
                  </div>
                </>
              );

              if (shortcut.onClick) {
                return (
                  <button key={idx} onClick={shortcut.onClick} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all focus:outline-none">
                    {content}
                  </button>
                )
              }

              return (
                <Link key={idx} to={shortcut.path || '#'} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  {content}
                </Link>
              )
            })}
          </div>
        )}

        {/* Realtime Teaching Activity for Admin/Monitor */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'monitor' || currentUser?.role === 'tendik') && (
          <div className="col-span-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Clock className="w-5 h-5 text-indigo-600" /> Kegiatan Mengajar Real-time
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live {currentTime.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Guru</th>
                    <th className="px-4 py-3">Mata Pelajaran</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3 rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{teacher.name}</td>
                      <td className="px-4 py-3 text-slate-600">{teacher.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{teacher.class}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{teacher.time}</td>
                      <td className="px-4 py-3 text-slate-600">{teacher.room}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold", 
                          teacher.status === 'Mengajar' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {teacher.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pengumuman Terbaru */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-bold mb-6">Pengumuman Terbaru</h2>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-md text-[10px] font-bold mb-2 inline-block">AKADEMIK</span>
              <h3 className="text-sm font-bold text-slate-900">Ujian Tengah Semester Akan Datang</h3>
              <p className="text-xs text-slate-600 mt-1">Harap segera menyelesaikan entri nilai UTS sebelum tanggal 15.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold mb-2 inline-block">RAPAT AGENDA</span>
              <h3 className="text-sm font-bold text-slate-900">Pertemuan Guru Mingguan</h3>
              <p className="text-xs text-slate-600 mt-1">Jumat, pukul 14:00 di Ruang Guru. Materi evaluasi pembelajaran harian.</p>
            </div>
          </div>
        </div>
        
        {/* Pelanggaran Terkini */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-bold mb-6">Catatan Pelanggaran Terkini</h2>
          {violations.length > 0 ? (
            <div className="space-y-4">
              {violations.slice(0, 3).map((v) => {
                const s = students.find(st => st.id === v.studentId);
                const isHeavy = v.points > 10;
                return (
                  <div key={v.id} className={cn("p-4 rounded-2xl border", isHeavy ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100")}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-slate-900">{s?.name} ({s?.gradeClass})</span>
                      <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold", isHeavy ? "bg-rose-200 text-rose-700" : "bg-amber-100 text-amber-700")}>
                        -{v.points} POIN
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{v.category} - {v.description}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">Oleh: {v.reportedBy}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
               <p className="text-sm text-slate-400 italic">Belum ada pelanggaran tercatat.</p>
            </div>
          )}
        </div>
      </div>
      <ImportMasterModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
}
