-- Silakan jalankan script SQL ini di fitur "SQL Editor" pada dashboard Supabase Anda.
-- (Biasanya dapat diakses melalui menu sebelah kiri berlambang terminal > "SQL Editor" > "New query")

CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guru_id VARCHAR(255),
    guru_name VARCHAR(255),
    class_name VARCHAR(50) NOT NULL,
    day VARCHAR(20) NOT NULL,
    period VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
