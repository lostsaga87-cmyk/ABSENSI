import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { Role } from '../types';
import { User as UserIcon, Briefcase, GraduationCap, Shield, Monitor as MonitorIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const rolesData = [
  { id: 'teacher', label: 'Guru', icon: UserIcon },
  { id: 'tendik', label: 'Tendik', icon: Briefcase },
  { id: 'student', label: 'Siswa', icon: GraduationCap },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'monitor', label: 'Monitor', icon: MonitorIcon },
] as const;

export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppData();
  
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Dummy login logic per role
    let loggedInUser = null;

    if (selectedRole === 'admin' && identifier === 'admin' && password === '@123') {
      loggedInUser = { id: 'u1', username: 'admin', role: 'admin', name: 'Administrator' };
    } else if (selectedRole === 'teacher' && identifier === 'guru' && password === 'guru') {
      loggedInUser = { id: 'u2', username: 'guru', role: 'teacher', name: 'Bapak Budi (Guru)' };
    } else if (selectedRole === 'tendik' && identifier === 'tendik' && password === 'tendik') {
      loggedInUser = { id: 'u3', username: 'tendik', role: 'tendik', name: 'Ibu Siti (Tendik)' };
    } else if (selectedRole === 'student' && identifier === 'siswa' && password === 'siswa') {
      loggedInUser = { id: 'u4', username: 'siswa', role: 'student', name: 'Andi Kusuma (Siswa)' };
    } else if (selectedRole === 'monitor' && identifier === 'monitor' && password === 'monitor') {
      loggedInUser = { id: 'u5', username: 'monitor', role: 'monitor', name: 'Tim Monitoring' };
    } else if (selectedRole === 'teacher') {
      // Check localStorage for mocked dynamic teachers
      try {
        const savedTeachers = JSON.parse(localStorage.getItem('mockTeachers') || '[]');
        const found = savedTeachers.find((t: any) => t.nip === identifier);
        // Using NIP as password for simplicity of the prompt "password nip"
        if (found && password === identifier) {
           loggedInUser = { id: `u-dyn-${found.nip}`, username: found.nip, role: 'teacher', name: found.name };
        }
      } catch(e) {}
    }

    if (loggedInUser) {
      setCurrentUser(loggedInUser as any);
      navigate('/');
    } else {
      setError(`Kredensial salah untuk akses ${rolesData.find(r => r.id === selectedRole)?.label}.`);
    }
  };

  const getIdentifierLabel = () => {
    switch (selectedRole) {
      case 'teacher':
      case 'tendik': return 'NIP';
      case 'student': return 'NIS';
      case 'admin':
      case 'monitor': return 'Username';
      default: return 'Username/ID';
    }
  };

  const getIdentifierPlaceholder = () => {
    return `Masukkan ${getIdentifierLabel()}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-sky-100 px-4">
      {/* Background decoration to loosely mimic landscape */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/50 via-sky-100 to-emerald-50/50 z-0">
        <svg className="absolute bottom-0 w-full h-auto text-emerald-100/60 opacity-80" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg className="absolute bottom-0 w-full h-48 text-emerald-200/40 opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L60,144C120,160,240,192,360,197.3C480,203,600,181,720,160C840,139,960,117,1080,117.3C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center mb-6">
        <div className="h-28 w-28 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-xl logo-shine-container z-10 border border-white relative overflow-hidden mb-4">
          <img 
            src="https://lh3.googleusercontent.com/d/1ezXCs_VCD_9IZwgWKjYT_i-OfXmeTW_I" 
            alt="SMPN 2 Sukorejo Logo" 
            className="h-20 w-20 object-contain drop-shadow-sm p-1"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-wider">LOGIN SISTEM</h1>
        <p className="text-sm text-slate-600 font-bold uppercase tracking-widest mt-1">SMPN 2 SUKOREJO</p>
      </div>

      <div className="z-10 w-full max-w-[500px] bg-white/40 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        
        {/* Role Tabs */}
        <div className="flex justify-between items-center bg-white/60 rounded-2xl p-2 mb-8 shadow-inner border border-white/40 overflow-x-auto gap-2">
          {rolesData.map(role => {
            const Icon = role.icon;
            const isActive = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id as Role);
                  setError('');
                  setIdentifier('');
                  setPassword('');
                }}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 min-w-[72px] flex-1 gap-1.5 focus:outline-none",
                  isActive 
                    ? "bg-indigo-500 text-white shadow-lg transform -translate-y-1" 
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                )}
              >
                <div className={cn("p-1.5 rounded-lg", isActive ? "bg-white/20" : "")}>
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
                <span className={cn("text-[10px] sm:text-xs font-bold tracking-wide leading-none", isActive ? "text-white" : "")}>{role.label}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 text-rose-600 p-3 rounded-xl text-sm border border-rose-500/20 text-center font-medium backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              {getIdentifierLabel()}
            </label>
            <input
              type="text"
              required
              className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/80 bg-white/80 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b14f] focus:border-[#00b14f] focus:bg-white transition-all shadow-sm"
              placeholder={getIdentifierPlaceholder()}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/80 bg-white/80 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00b14f] focus:border-[#00b14f] focus:bg-white transition-all shadow-sm pr-12"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00b14f] transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-[#00b14f] hover:bg-[#009b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b14f] transition-all shadow-lg shadow-[#00b14f]/30 text-lg"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors focus:outline-none" onClick={() => navigate('/')}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
