import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { Save } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Attendance() {
  const { students, attendances, setAttendances } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('X-A');

  // get unique classes from students
  const allClasses = Array.from(new Set(students.map(s => s.gradeClass)));
  
  // students in selected class
  const classStudents = students.filter(s => s.gradeClass === selectedClass);

  // find existing record for date and class
  const existingRecord = attendances.find(a => a.date === selectedDate && a.gradeClass === selectedClass);

  // current edit state
  const [currentStatuses, setCurrentStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const statuses: Record<string, AttendanceStatus> = {};
    if (existingRecord) {
      existingRecord.records.forEach(r => statuses[r.studentId] = r.status);
    } else {
      classStudents.forEach(s => statuses[s.id] = 'Hadir');
    }
    return statuses;
  });

  // Effect to update statuses when class or date changes
  React.useEffect(() => {
    const statuses: Record<string, AttendanceStatus> = {};
    const record = attendances.find(a => a.date === selectedDate && a.gradeClass === selectedClass);
    if (record) {
      record.records.forEach(r => statuses[r.studentId] = r.status);
    } else {
      classStudents.forEach(s => statuses[s.id] = 'Hadir');
    }
    setCurrentStatuses(statuses);
  }, [selectedDate, selectedClass, attendances, students.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setCurrentStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const records = Object.entries(currentStatuses).map(([studentId, status]) => ({
      studentId,
      status: status as AttendanceStatus
    }));

    const updatedRecord: AttendanceRecord = {
      id: existingRecord?.id || Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      gradeClass: selectedClass,
      records
    };

    if (existingRecord) {
      setAttendances(attendances.map(a => a.id === existingRecord.id ? updatedRecord : a));
    } else {
      setAttendances([...attendances, updatedRecord]);
    }
    
    alert('Data absensi berhasil disimpan!');
  };

  const statusColors = {
    'Hadir': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'Sakit': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    'Izin': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'Alpa': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  };

  return (
    <div className="space-y-6 flex flex-col h-full shrink-0">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Absensi Siswa</h1>
          <p className="text-slate-500">Mencatat dan memantau kehadiran siswa per kelas.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 inline-flex items-center"
        >
          <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Simpan Absensi
        </button>
      </header>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end shrink-0">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Tanggal</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Kelas</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-slate-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-32"
          >
            {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
        {classStudents.length > 0 ? (
          <div className="overflow-auto flex-1">
            <ul className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => (
                <li key={student.id} className={cn("p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", idx % 2 === 1 ? 'bg-slate-50/50' : 'hover:bg-slate-50/50')}>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{student.name}</span>
                    <span className="text-xs text-slate-500">NIS: {student.nis}</span>
                  </div>
                  <div className="flex relative z-0 inline-flex shadow-sm rounded-lg overflow-hidden">
                    {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as AttendanceStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(student.id, status)}
                        className={cn(
                          "relative inline-flex items-center px-4 py-2 border-y border-x text-sm font-bold transition-colors",
                          currentStatuses[student.id] === status 
                            ? statusColors[status] 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-12 border-t border-slate-100 text-center text-slate-500 italic">
            Tidak ada siswa di kelas ini.
          </div>
        )}
      </div>
    </div>
  );
}
