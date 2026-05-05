import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  GraduationCap, 
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  User,
  Info,
  MapPin,
  UserPlus,
  Moon
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { currentUser, logout } = useAppData();
  const location = useLocation();
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isAdminOrMonitor = currentUser.role === 'admin' || currentUser.role === 'monitor';

  // Admin/Monitor Side Nav
  const sideNavItems = [
    { name: 'Dasbor', path: '/', icon: LayoutDashboard, roles: ['admin', 'monitor'] },
    { name: 'Data Siswa', path: '/students', icon: Users, roles: ['admin', 'monitor'] },
    { name: 'Data Guru', path: '/teachers', icon: UserPlus, roles: ['admin'] },
    { name: 'Absensi', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'monitor'] },
    { name: 'Pelanggaran', path: '/violations', icon: AlertTriangle, roles: ['admin', 'monitor'] },
    { name: 'Data Nilai', path: '/grades', icon: GraduationCap, roles: ['admin', 'monitor'] },
    { name: 'Geofencing', path: '/geofencing', icon: MapPin, roles: ['admin'] },
    { name: 'Profil', path: '/profile', icon: User, roles: ['admin', 'monitor'] },
  ];

  const filteredSideNavItems = sideNavItems.filter(item => item.roles.includes(currentUser.role));

  // User Bottom Nav (Teacher, Tendik, Student)
  const bottomNavItems = [
    { name: 'Dasbor', path: '/', icon: LayoutDashboard },
    { name: 'Menu', path: '/menu', icon: MenuIcon },
    // LOGO goes here usually
    { name: 'Profil', path: '/profile', icon: User },
    { name: 'Tentang', path: '/about', icon: Info },
  ];

  return (
    <div className="flex flex-col md:flex-row font-sans text-slate-800 h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar Nav (Only for Admin & Monitor) */}
      {isAdminOrMonitor && (
        <aside 
          className={cn(
            "hidden md:flex bg-slate-900 h-full flex-col text-white py-6 transition-all duration-300 ease-in-out z-20 shrink-0",
            isSidebarExpanded ? "w-64 px-6" : "w-20 px-3 items-center"
          )}
        >
          <div className={cn("flex items-center mb-10 overflow-hidden", isSidebarExpanded ? "gap-3" : "justify-center")}>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative overflow-hidden logo-shine-container shadow-lg shrink-0">
              <img 
                src="https://lh3.googleusercontent.com/d/1ezXCs_VCD_9IZwgWKjYT_i-OfXmeTW_I" 
                alt="SMPN 2 Sukorejo Logo" 
                className="h-7 w-7 object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            {isSidebarExpanded && (
              <span className="text-lg font-bold tracking-tight leading-tight whitespace-nowrap">SMPN 2<br />Sukorejo</span>
            )}
          </div>
          
          <div className="space-y-2 flex-1 w-full overflow-y-auto custom-scrollbar pr-1">
            {filteredSideNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!isSidebarExpanded ? item.name : undefined}
                  className={cn(
                    "py-3 rounded-xl flex items-center transition-colors cursor-pointer",
                    isSidebarExpanded ? "px-4 gap-3 mx-0" : "justify-center w-12 mx-auto",
                    isActive 
                      ? "bg-indigo-600 shadow-lg shadow-indigo-900/20" 
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", !isActive && "opacity-80")} />
                  {isSidebarExpanded && (
                    <span className={cn("text-sm font-medium whitespace-nowrap", !isActive && "opacity-80")}>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto w-full pt-4">
            <div className={cn(
              "bg-slate-800 rounded-2xl flex items-center relative group transition-all",
              isSidebarExpanded ? "p-4 gap-3" : "w-12 h-12 p-0 mx-auto justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              {isSidebarExpanded && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate">{currentUser.name}</span>
                  <span className="text-xs opacity-50 capitalize">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Monitor'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 overflow-hidden",
        !isAdminOrMonitor ? "pb-24" : "" // Extra padding for bottom nav
      )}>
        {/* Header Bar */}
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {isAdminOrMonitor && (
              <button 
                onClick={() => setSidebarExpanded(!isSidebarExpanded)}
                className="hidden md:block p-2 rounded-lg text-slate-500 hover:text-slate-900 bg-white border border-slate-200 shadow-sm transition-colors"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            )}
            {!isAdminOrMonitor && (
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                   {currentUser.name.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
                   <span className="text-xs text-slate-500 capitalize">{currentUser.role}</span>
                 </div>
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex bg-white rounded-xl py-2 px-3 sm:px-4 border border-slate-200 flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-4 shadow-sm">
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium capitalize">{formattedDate}</div>
              <div className="hidden sm:block w-px h-4 bg-slate-200"></div>
              <div className="text-sm sm:text-base md:text-lg font-bold text-indigo-600 font-mono tracking-wider leading-none">{formattedTime.replace(/\./g, ':')}</div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Ganti Tema"
              >
                <Moon className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full rounded-2xl">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Only for Users: Teacher, Tendik, Student) */}
      {!isAdminOrMonitor && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-6 py-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe rounded-t-3xl backdrop-blur-md bg-white/90">
          <div className="max-w-md mx-auto flex justify-between items-center relative">
            
            {/* Left Nav Items */}
            <div className="flex w-2/5 justify-between pr-4">
              {bottomNavItems.slice(0, 2).map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-2 focus:outline-none">
                    <Icon className={cn("w-6 h-6 transition-all duration-300", isActive ? "text-indigo-600 scale-110 drop-shadow-sm" : "text-slate-400")} />
                    <span className={cn("text-[10px] font-medium transition-all duration-300", isActive ? "text-indigo-600 font-bold" : "text-slate-500")}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Central Main Logo Button */}
            <div className="absolute left-1/2 -top-8 -translate-x-1/2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center border border-indigo-50 border-t-indigo-100 logo-shine-container z-10 transition-transform hover:scale-105 active:scale-95">
                <img 
                  src="https://lh3.googleusercontent.com/d/1ezXCs_VCD_9IZwgWKjYT_i-OfXmeTW_I" 
                  alt="SMPN 2 Sukorejo Logo" 
                  className="h-10 w-10 object-contain drop-shadow-sm p-0.5"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Right Nav Items */}
            <div className="flex w-2/5 justify-between pl-4">
              {bottomNavItems.slice(2, 4).map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 p-2 focus:outline-none">
                    <Icon className={cn("w-6 h-6 transition-all duration-300", isActive ? "text-indigo-600 scale-110 drop-shadow-sm" : "text-slate-400")} />
                    <span className={cn("text-[10px] font-medium transition-all duration-300", isActive ? "text-indigo-600 font-bold" : "text-slate-500")}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
