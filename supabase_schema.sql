-- Create custom Enum for roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'tendik', 'student', 'monitor');

-- 1. Users Table (Tabel Pengguna)
-- Menggunakan tabel custom untuk menyimpan kredensial. Jika menggunakan Supabase Auth bawaan,
-- ini sebaiknya diubah menjadi tabel `profiles` yang berelasi ke `auth.users`.
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Catatan: Di produksi, gunakan hash (bcrypt), bukan plaintext
  role user_role NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students Table (Tabel Siswa)
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Relasi ke akun login siswa
  nisn TEXT UNIQUE,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('L', 'P')),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Guru Table (Tabel Guru)
CREATE TABLE guru (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Relasi ke akun login
  nip TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  mata_pelajaran TEXT, -- koma separated untuk guru
  wali_kelas TEXT, -- Wali Kelas (Opsional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tendik Table (Tabel Tenaga Kependidikan)
CREATE TABLE tendik (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Relasi ke akun login
  nip TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  mata_pelajaran TEXT, -- Sesuai format CSV (meskipun biasanya kosong/berisi jabatan)
  wali_kelas TEXT, -- Sesuai format CSV
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attendance Table (Tabel Absensi)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Terlambat', 'Alpa')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  photo_url TEXT, -- URL file bukti foto jika ada
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Violations Table (Tabel Pelanggaran)
CREATE TABLE violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Pegawai yang mencatat
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  violation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Grades Table (Tabel Nilai)
CREATE TABLE grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES guru(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Geofencing Settings (Tabel Pengaturan Absensi Radius)
CREATE TABLE geofencing_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Realtime Teaching Activities (Tabel Kegiatan Mengajar Realtime)
CREATE TABLE teaching_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES guru(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  room TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Mengajar', 'Standby', 'Selesai')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Data Dummy untuk Demo

-- Insert Admin
INSERT INTO users (username, password_hash, role, name) 
VALUES ('admin', '@123', 'admin', 'Administrator');

-- Insert Teacher Demo
INSERT INTO users (username, password_hash, role, name) 
VALUES ('guru', 'guru', 'teacher', 'Bapak Budi (Guru)');

-- Insert Tendik Demo
INSERT INTO users (username, password_hash, role, name) 
VALUES ('tendik', 'tendik', 'tendik', 'Ibu Siti (Tendik)');

-- Insert Student Demo
INSERT INTO users (username, password_hash, role, name) 
VALUES ('siswa', 'siswa', 'student', 'Andi Kusuma (Siswa)');

-- Insert Monitor Demo
INSERT INTO users (username, password_hash, role, name) 
VALUES ('monitor', 'monitor', 'monitor', 'Tim Monitoring');

-- Enable Row Level Security (opsional tapi sangat disarankan)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE tendik ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofencing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_activities ENABLE ROW LEVEL SECURITY;

-- Contoh Policy (Kebijakan Akses) agar data bisa dibaca oleh Front-end secara public saat tahap develop (sesuaikan nanti dengan user authentication sebenarnya)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON guru FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tendik FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON violations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON grades FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON geofencing_settings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON teaching_activities FOR SELECT USING (true);

-- Catatan Penting: Pada level production, hilangkan policy public "true" di atas
-- dan gunakan otorisasi `auth.uid() = user_id` dari Supabase.
