import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowRight, ShieldCheck, Mail, Lock, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // In a real app, this would be a full auth request
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Silakan masukkan email Anda');
      return;
    }

    setLoading(true);
    try {
      // Fetch users to see if they exist and what their role is
      const res = await fetch('/api/users');
      const users = await res.json();
      
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        toast.success(`Selamat datang kembali, ${user.name}!`);
        // Simulate a small delay for a smooth transition
        setTimeout(() => {
          onLogin(user);
        }, 800);
      } else {
        toast.error('Akun tidak ditemukan. Silakan hubungi Superuser.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat masuk');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] rounded-full bg-amber-100/50 blur-[100px]" />
      </div>

      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100">
        {/* Left Side - Visual/Marketing */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-900 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter italic">c-invoicer</span>
            </div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold leading-tight tracking-tight"
              >
                Kelola Invoice <br />
                <span className="text-indigo-400 font-black italic">Tanpa Batas.</span>
              </motion.h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
                Sistem manajemen invoice profesional untuk jasa, penyewaan, dan produk ritel.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Keamanan Terjamin</span>
                  <span className="text-[10px] text-slate-500">Akses bertingkat sesuai peran pengguna.</span>
                </div>
             </div>
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center opacity-50 pt-4">
                © 2024 C-Invoicer Enterprise
             </div>
          </div>

          {/* Abstract pattern bg */}
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
             <Building2 className="w-64 h-64 -mb-12 -mr-12" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 md:hidden flex justify-center">
             <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-black tracking-tighter italic text-slate-900">c-invoicer</span>
             </div>
          </div>

          <div className="space-y-2 mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Silakan masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  type="email" 
                  placeholder="anda@email.com"
                  className="pl-10 h-11 bg-slate-50 border-slate-100 focus:ring-indigo-500 transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic font-medium px-1">
                Gunakan email yang sudah terdaftar oleh admin.
              </p>
            </div>

            <div className="space-y-1.5 opacity-50 cursor-not-allowed">
              <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password (Coming Soon)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input 
                  disabled
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-slate-100 border-transparent text-sm"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white h-11 rounded-xl shadow-lg shadow-indigo-100 transition-all font-bold text-sm flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </AnimatePresence>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-1">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Belum punya akun?</span>
               <p className="text-[10px] text-slate-400 text-center">
                 Hubungi unit kerja atau administrator perusahaan Anda <br/> untuk mendapatkan akses.
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
