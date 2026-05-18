import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle, 
  TrendingUp,
  Receipt,
  LogOut,
  Package,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'Invoices', path: '/invoices' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Package, label: 'Jasa & Sewa', path: '/products' },
  { icon: FileText, label: 'Laporan', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface LayoutProps {
  user: any;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const [settings, setSettings] = React.useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50/50 relative overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-right border-slate-200 flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-6 h-6 object-contain rounded" />
            ) : (
              <TrendingUp className="w-6 h-6 text-indigo-600 shrink-0" />
            )}
            <span className="truncate">{settings?.company_name || 'c-invoicer'}</span>
          </h1>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-50">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                 <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                 <span className="text-[11px] font-bold text-slate-800 truncate">{user?.name}</span>
                 <span className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">{user?.role}</span>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <button 
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
             <button 
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
             >
                <Menu className="w-5 h-5" />
             </button>
             <h2 className="hidden lg:block text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                Management System
             </h2>
          </div>
          <div className="flex items-center gap-3">
             <NavLink to="/invoices/new" className="bg-slate-900 hover:bg-indigo-600 text-white px-4 h-9 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-slate-100 transition-all transform hover:scale-[1.02] active:scale-95 group">
                <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                <span className="hidden sm:inline">Invoice Baru</span>
                <span className="sm:hidden">Invoice</span>
             </NavLink>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
           <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Outlet />
           </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
