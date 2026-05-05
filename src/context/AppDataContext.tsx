import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student, AttendanceRecord, Violation, Grade, User } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendances: AttendanceRecord[];
  setAttendances: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  violations: Violation[];
  setViolations: React.Dispatch<React.SetStateAction<Violation[]>>;
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  logout: () => void;
}

const AppDataContext = createContext<AppContextType | undefined>(undefined);

const DUMMY_STUDENTS: Student[] = [
  { id: '1', nis: '1001', name: 'Budi Santoso', gradeClass: 'X-A', gender: 'L', phone: '081234567890' },
  { id: '2', nis: '1002', name: 'Siti Aminah', gradeClass: 'X-A', gender: 'P', phone: '081234567891' },
  { id: '3', nis: '1003', name: 'Andi Kusuma', gradeClass: 'X-B', gender: 'L', phone: '081234567892' },
  { id: '4', nis: '1004', name: 'Rina Wati', gradeClass: 'XI-A', gender: 'P', phone: '081234567893' },
];

const DUMMY_VIOLATIONS: Violation[] = [
  { id: 'v1', date: '2023-10-01', studentId: '1', category: 'Keterlambatan', description: 'Terlambat lebih dari 15 menit', points: 5, reportedBy: 'Pak Guru' }
];

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>(DUMMY_STUDENTS);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [violations, setViolations] = useState<Violation[]>(DUMMY_VIOLATIONS);
  const [grades, setGrades] = useState<Grade[]>([]);

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppDataContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        students,
        setStudents,
        attendances,
        setAttendances,
        violations,
        setViolations,
        grades,
        setGrades,
        logout,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
