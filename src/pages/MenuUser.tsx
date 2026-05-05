import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { CalendarCheck, AlertTriangle, GraduationCap, LayoutDashboard, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MenuUser() {
  const { currentUser } = useAppData();

  const menuItems = [
    { name: 'Dasbor', path: '/', icon: LayoutDashboard, roles: ['teacher', 'tendik', 'student', 'monitor'] },
    { name: 'Absensi', path: '/attendance', icon: CalendarCheck, roles: ['teacher', 'tendik'] },
    { name: 'Pelanggaran', path: '/violations', icon: AlertTriangle, roles: ['teacher', 'tendik'] },
    { name: 'Data Nilai', path: '/grades', icon: GraduationCap, roles: ['teacher'] },
    { name: 'Profil', path: '/profile', icon: User, roles: ['teacher', 'tendik', 'student', 'monitor'] },
  ];

  const allowedMenus = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Menu Utama</h1>
        <p className="text-slate-500">
          Akses cepat ke berbagai fitur aplikasi
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allowedMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <Link 
              key={menu.path} 
              to={menu.path}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 text-sm">{menu.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
