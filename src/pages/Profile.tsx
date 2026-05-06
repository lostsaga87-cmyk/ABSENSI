import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import { User, KeyRound, BookOpen, Upload, Camera, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';

const subjects = [
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Bahasa Daerah',
  'IPA',
  'IPS',
  'MTK',
  'Informatika',
  'Seni Rupa',
  'Pendidikan Pancasila',
  'Pendidikan Agama dan Budi Pekerti',
  'BK',
  'BTQ',
  'PJOK'
];

export default function Profile() {
  const { currentUser, setCurrentUser } = useAppData();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Guru states
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'teacher') {
      const loadGuruData = async () => {
        const { data, error } = await supabase
          .from('guru')
          .select('mata_pelajaran, photo_url')
          .eq('user_id', currentUser.id)
          .single();
        
        if (data) {
          if (data.mata_pelajaran) setSelectedSubjects(data.mata_pelajaran.split(',').map((s: string) => s.trim()));
          if (data.photo_url) setPhotoDataURL(data.photo_url);
        }
      };
      loadGuruData();
    }
  }, [currentUser]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB
      setMessage({ text: 'Ukuran foto maksimal 1MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file could be selected again
    e.target.value = '';
  };

  const getCroppedImg = async (imageSrc: string, crop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // set actual size
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    ctx?.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSaveCrop = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        setPhotoDataURL(croppedImage);
        setShowCropper(false);
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Gagal memotong gambar', type: 'error' });
    }
  };

  const handleSaveGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // Perbarui subject dan foto di tabel guru
      const { error: guruError } = await supabase
        .from('guru')
        .update({
          mata_pelajaran: selectedSubjects.join(', '),
          photo_url: photoDataURL
        })
        .eq('user_id', currentUser.id);

      if (guruError) throw guruError;

      // Perbarui password di tabel users jika diisi
      if (currentPassword && newPassword) {
        // Cek password lama terlebih dahulu (di aplikasi nyata gunakan backend cek)
        const { data: user, error: passCheckError } = await supabase
          .from('users')
          .select('password_hash')
          .eq('id', currentUser.id)
          .single();
          
        if (passCheckError) throw passCheckError;

        if (user.password_hash !== currentPassword) {
          throw new Error('Password lama tidak sesuai');
        }

        const { error: userError } = await supabase
          .from('users')
          .update({ password_hash: newPassword })
          .eq('id', currentUser.id);

        if (userError) throw userError;
        
        setCurrentPassword('');
        setNewPassword('');
      }

      setCurrentUser({
        ...currentUser,
        photo_url: photoDataURL || undefined
      });

      setMessage({ text: 'Profil berhasil diperbarui!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || 'Terjadi kesalahan saat menyimpan profil', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil Pengguna</h1>
        <p className="text-slate-500">
          Kelola informasi profil dan kredensial akses
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-6 mb-8">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative">
              {photoDataURL ? (
                <img src={photoDataURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-700">{currentUser?.name.charAt(0)}</span>
              )}
              {currentUser?.role === 'teacher' && (
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{currentUser?.name}</h2>
            <p className="text-slate-500 capitalize">{currentUser?.role}</p>
          </div>
        </div>

        {currentUser?.role === 'admin' ? (
          <form className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Ubah Data Login</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Username Baru
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Password Lama
              </label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4" 
              />
              
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <button type="button" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Simpan Perubahan
            </button>
          </form>
        ) : currentUser?.role === 'teacher' ? (
          <form className="space-y-6" onSubmit={handleSaveGuru}>
            <h3 className="text-lg font-semibold border-b pb-2">Edit Profil Guru</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> NIP (Username)
              </label>
              <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                {currentUser?.username}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Mata Pelajaran yang Diampu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <label key={subject} className="flex items-start gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 leading-tight">{subject}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Ubah Password
              </h4>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Lama
              </label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4" 
              />
              
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>          
        ) : (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">ID Pengguna (Username)</label>
              <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                {currentUser?.username}
              </div>
            </div>
            <p className="text-xs text-slate-400">Hubungi Administrator jika Anda ingin mengubah informasi profil.</p>

            <div className="pt-6 mt-4 border-t border-slate-100">
            </div>
          </div>
        )}
      </div>

      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Sesuaikan Foto Profil</h3>
              <button onClick={() => setShowCropper(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative h-80 w-full bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            
            <div className="p-4 bg-slate-50 border-t space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowCropper(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveCrop}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Gunakan Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
