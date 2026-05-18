import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    is_vendor: false
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        toast.success('Pelanggan berhasil ditambahkan!');
        setIsDialogOpen(false);
        setNewCustomer({ name: '', email: '', phone: '', address: '', is_vendor: false });
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Gagal menambahkan pelanggan.');
    }
  };

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pelanggan</h2>
          <p className="text-xs text-slate-500">Kelola data klien dan vendor Anda.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs h-8">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Pelanggan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  required 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input 
                    id="phone" 
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Input 
                  id="address" 
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="is_vendor" 
                  checked={newCustomer.is_vendor}
                  onChange={(e) => setNewCustomer({...newCustomer, is_vendor: e.currentTarget.checked})}
                />
                <Label htmlFor="is_vendor" className="cursor-pointer">Ini adalah Vendor (Pemasok)</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-indigo-600">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input 
          placeholder="Cari nama atau email..." 
          className="pl-8 h-8 text-xs bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableHeader className="bg-slate-50/50">
            <TableRow className="h-10">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Info Kontak</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipe</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-12">
                   {[...Array(5)].map((_, j) => (
                     <TableCell key={j} className="p-3"><div className="h-3 bg-slate-50 animate-pulse rounded" /></TableCell>
                   ))}
                </TableRow>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id} className="group hover:bg-slate-50/50 transition-colors h-14">
                  <TableCell className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] uppercase border border-indigo-100">
                        {customer.name.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-800 text-xs">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex flex-col gap-0.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
                          <Mail className="w-3 h-3 opacity-70" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium">
                          <Phone className="w-3 h-3 opacity-70" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] p-3">
                     <div className="flex items-start gap-1.5 text-slate-500 text-[10px] font-medium line-clamp-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                        <span>{customer.address || '-'}</span>
                     </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <Badge variant="outline" className={cn(
                      "font-bold text-[9px] uppercase tracking-wider px-1.5 py-0 rounded",
                      customer.is_vendor ? "border-amber-200 text-amber-700 bg-amber-50" : "border-indigo-200 text-indigo-700 bg-indigo-50"
                    )}>
                      {customer.is_vendor ? 'Vendor' : 'Customer'}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3">
                     <Button variant="ghost" className="h-7 w-7 p-0 border-none hover:bg-slate-100">
                        <MoreHorizontal className="h-3.5 h-3.5" />
                     </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                   <div className="flex flex-col items-center justify-center text-slate-300">
                      <Users className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-xs">Belum ada data pelanggan.</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
