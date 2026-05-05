import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function Geofencing() {
  const [radius, setRadius] = useState(500);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Geofencing & Lokasi</h1>
        <p className="text-slate-500">
          Atur batas wilayah absensi untuk pengguna aplikasi.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="text-indigo-600" /> Pengaturan Wilayah Absensi
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Koordinat Pusat (Gedung Sekolah)
            </label>
            <div className="flex gap-4">
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Latitude (-7.xxxxx)" />
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Longitude (112.xxxxx)" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Batas Radius (Meter)
            </label>
            <input 
              type="number" 
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
            <p className="text-xs text-slate-500 mt-1">Pengguna hanya dapat melakukan absensi dalam radius {radius} meter dari koordinat pusat.</p>
          </div>

          <div className="pt-4">
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
