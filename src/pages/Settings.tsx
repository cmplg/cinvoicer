import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users2, 
  Save, 
  Trash2, 
  UserPlus, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Plus,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingsProps {
  currentUser: any;
}

export default function Settings({ currentUser }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    company_name: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [users, setUsers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'user', password: '' });
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '', details: '' });
  const [editingUserPassword, setEditingUserPassword] = useState<{id: number, newPassword: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, usersRes, paymentRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/users'),
        fetch('/api/payment-methods')
      ]);
      const settingsData = await settingsRes.json();
      const usersData = await usersRes.json();
      const paymentData = await paymentRes.json();
      
      setSettings(settingsData);
      setUsers(usersData);
      setPaymentMethods(paymentData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal mengambil data pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Pengaturan profil perusahaan berhasil disimpan');
      }
    } catch (error) {
      toast.error('Gagal menyimpan profil perusahaan');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast.error('Email, nama, dan password wajib diisi');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        toast.success('User baru berhasil ditambahkan');
        setNewUser({ email: '', name: '', role: 'user', password: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal menambahkan user');
    }
  };

  const handleUpdateUserPassword = async (userId: number, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        toast.success('Password user berhasil direset');
        setEditingUserPassword(null);
        fetchData();
      } else {
        toast.error('Gagal mereset password');
      }
    } catch (error) {
      toast.error('Gagal mereset password');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User berhasil dihapus');
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal menghapus user');
    }
  };

  const handleCreatePaymentMethod = async () => {
    if (!newPaymentMethod.name) {
      toast.error('Nama metode pembayaran wajib diisi');
      return;
    }
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPaymentMethod)
      });
      if (res.ok) {
        toast.success('Metode pembayaran berhasil ditambahkan');
        setNewPaymentMethod({ name: '', details: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal menambahkan metode pembayaran');
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    if (!confirm('Hapus metode pembayaran ini?')) return;
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Metode pembayaran berhasil dihapus');
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal menghapus metode pembayaran');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan</h2>
        <p className="text-xs text-slate-400">Kelola profil bisnis dan akses pengguna Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <TabsList className="bg-slate-100/80 p-0.5 h-10 w-fit mb-6 inline-flex min-w-full sm:min-w-0">
            <TabsTrigger value="profile" className="text-xs px-4 h-9 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              Profil<span className="hidden sm:inline"> Perusahaan</span>
            </TabsTrigger>
            {currentUser?.role === 'superuser' && (
              <TabsTrigger value="users" className="text-xs px-4 h-9 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manajemen </span>User
              </TabsTrigger>
            )}
            <TabsTrigger value="payment" className="text-xs px-4 h-9 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Metode<span className="hidden sm:inline"> Pembayaran</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="px-6 pt-5 pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Informasi Dasar</CardTitle>
              <CardDescription className="text-[11px]">Gunakan detail ini untuk identitas invoice Anda.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Nama Perusahaan</Label>
                    <Input 
                      value={settings.company_name} 
                      onChange={e => setSettings({...settings, company_name: e.target.value})}
                      className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">URL Logo (PNG/JPG)</Label>
                    <Input 
                      value={settings.logo_url} 
                      onChange={e => setSettings({...settings, logo_url: e.target.value})}
                      placeholder="https://example.com/logo.png"
                      className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Nomor Telepon</Label>
                    <Input 
                      value={settings.phone} 
                      onChange={e => setSettings({...settings, phone: e.target.value})}
                      className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Email Bisnis</Label>
                    <Input 
                      value={settings.email} 
                      onChange={e => setSettings({...settings, email: e.target.value})}
                      className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Kantor</Label>
                    <textarea 
                      className="w-full rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                      rows={4}
                      value={settings.address}
                      onChange={e => setSettings({...settings, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-50">
                <Button onClick={handleUpdateSettings} className="bg-indigo-600 hover:bg-indigo-700 text-xs h-9 gap-2 shadow-sm">
                  <Save className="w-3.5 h-3.5" />
                  Simpan Profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-none shadow-md bg-white h-fit">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tambah User</CardTitle>
                <CardDescription className="text-[11px]">Berikan akses ke staf atau admin tambahan.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</Label>
                  <Input 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Email</Label>
                  <Input 
                    type="email"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Peran / Role</Label>
                  <select 
                    className="w-full h-9 rounded-md border border-slate-100 bg-slate-50/50 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="user">User (Standard)</option>
                    <option value="admin">Admin</option>
                    <option value="superuser">Superuser</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <Input 
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newUser.password} 
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="pl-10 bg-slate-50/50 border-slate-100 text-xs h-9"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">Password akan digunakan saat login.</p>
                </div>
                <Button onClick={handleCreateUser} className="w-full bg-slate-900 hover:bg-slate-800 text-xs h-9 gap-2 mt-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Tambah Akun
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-md bg-white overflow-hidden">
               <CardHeader className="px-6 pt-5 pb-2 border-b border-slate-50">
                 <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Daftar Pengguna</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] lg:min-w-full">
                      <TableHeader className="bg-slate-50/30">
                        <TableRow className="border-slate-50 h-10 hover:bg-transparent">
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-6">User</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</TableHead>
                          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-6 text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u: any) => (
                          <TableRow key={u.id} className="border-slate-50 h-14 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">{u.name}</span>
                                <span className="text-[10px] text-slate-400">{u.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn(
                                "capitalize text-[9px] font-bold px-1.5 py-0 rounded",
                                u.role === 'superuser' ? "bg-indigo-50 text-indigo-700" : 
                                u.role === 'admin' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                              )}>
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6 text-right flex items-center justify-end gap-2">
                              {editingUserPassword?.id === u.id ? (
                                <div className="flex gap-1 items-center">
                                  <Input 
                                    type="password"
                                    placeholder="Password baru"
                                    value={editingUserPassword.newPassword}
                                    onChange={(e) => setEditingUserPassword({...editingUserPassword, newPassword: e.target.value})}
                                    className="h-7 text-xs w-32"
                                  />
                                  <Button size="sm" onClick={() => handleUpdateUserPassword(u.id, editingUserPassword.newPassword)} className="h-7 text-xs bg-indigo-600">
                                    Simpan
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingUserPassword(null)} className="h-7 text-xs">
                                    Batal
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={u.email === currentUser.email}
                                    onClick={() => setEditingUserPassword({id: u.id, newPassword: ''})}
                                    className="h-7 px-2 text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                    title="Reset password"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={u.email === currentUser.email}
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-none shadow-md bg-white h-fit">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tambah Metode</CardTitle>
                <CardDescription className="text-[11px]">Tambahkan instruksi pembayaran (Rekening, dll).</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Nama Metode</Label>
                  <Input 
                    placeholder="Contoh: Transfer Bank Mandiri"
                    value={newPaymentMethod.name}
                    onChange={e => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                    className="bg-slate-50/50 border-slate-100 text-xs h-9" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Instruksi / Detail</Label>
                  <textarea 
                    placeholder="Contoh: A/N PT Berkah Selalu - 123-456-789"
                    className="w-full rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    rows={4}
                    value={newPaymentMethod.details}
                    onChange={e => setNewPaymentMethod({...newPaymentMethod, details: e.target.value})}
                  />
                </div>
                <Button onClick={handleCreatePaymentMethod} className="w-full bg-slate-900 hover:bg-slate-800 text-xs h-9 gap-2 mt-2">
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Metode
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-md bg-white">
              <CardHeader className="px-6 pt-5 pb-2 border-b border-slate-50">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Daftar Metode</CardTitle>
              </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px] lg:min-w-full">
                  <TableHeader>
                    <TableRow className="border-slate-50 h-10 hover:bg-transparent">
                      <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-6">Label</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instruksi</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-6 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.length > 0 ? paymentMethods.map((pm: any) => (
                      <TableRow key={pm.id} className="border-slate-50 h-14 hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <span className="text-xs font-bold text-slate-800">{pm.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{pm.details}</span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-xs text-slate-300">
                          Belum ada metode pembayaran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
