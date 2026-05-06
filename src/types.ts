export type Role = 'admin' | 'teacher' | 'tendik' | 'student' | 'monitor';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  photo_url?: string;
}

export interface Student {
  id: string;
  user_id?: string;
  nisn?: string;
  nis: string;
  name: string;
  class_name: string;
  gender?: 'L' | 'P';
  birth_date?: string;
  created_at?: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface AttendanceRecord {
  id: string;
  date: string;
  gradeClass: string;
  records: {
    studentId: string;
    status: AttendanceStatus;
  }[];
}

export interface Violation {
  id: string;
  date: string;
  studentId: string;
  category: string;
  description: string;
  points: number;
  reportedBy: string; // Teacher/Admin name
}

export interface Grade {
  id: string;
  studentId: string;
  semester: string;
  subject: string;
  score: number;
}
