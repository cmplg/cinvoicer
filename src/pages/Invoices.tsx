import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  ChevronRight,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  X
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    company_name: 'c-invoicer',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoiceDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      setSelectedInvoice(data);
      setIsPreviewOpen(true);
    } catch (err) {
      toast.error('Gagal memuat detail invoice');
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Status diperbarui menjadi ${newStatus}`);
        fetchInvoices();
      } else {
        toast.error('Gagal memperbarui status');
      }
    } catch (err) {
      toast.error('Oops! Terjadi kesalahan server');
    }
  };

  const filteredInvoices = invoices.filter((inv: any) => {
    const matchesFilter = filter === 'all' || inv.type === filter;
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h2>
          <p className="text-xs text-slate-500">Kelola semua tagihan keluar dan masuk Anda di sini.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none items-center gap-2 border-slate-200 text-xs h-8">
               <Download className="w-3.5 h-3.5" />
               <span>Export Data</span>
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setFilter}>
          <TabsList className="bg-slate-100/80 p-0.5 h-8">
            <TabsTrigger value="all" className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm">Semua</TabsTrigger>
            <TabsTrigger value="sale" className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm">Penjualan</TabsTrigger>
            <TabsTrigger value="purchase" className="text-xs px-3 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pembelian</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-8 h-8 text-xs bg-white border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableHeader className="bg-slate-50/50">
            <TableRow className="h-10 border-slate-100">
              <TableHead className="w-[120px] text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-6">No. Invoice</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pelanggan</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipe</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</TableHead>
              <TableHead className="w-[40px] pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-14">
                   {[...Array(7)].map((_, j) => (
                     <TableCell key={j} className="p-3"><div className="h-3 bg-slate-50 animate-pulse rounded" /></TableCell>
                   ))}
                </TableRow>
              ))
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv: any) => (
                <TableRow key={inv.id} className="group hover:bg-slate-50/50 transition-colors h-16 border-slate-50">
                  <TableCell className="pl-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-xs">{inv.invoice_number}</span>
                      {inv.payment_method && (
                        <span className="text-[9px] text-indigo-500 font-bold uppercase">{inv.payment_method}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <p className="font-bold text-slate-700 text-xs">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{inv.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs py-3 font-medium">
                    {new Date(inv.issue_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-3">
                    {inv.type === 'sale' ? (
                       <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50/50 w-fit px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase">OUT</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-1 text-rose-600 bg-rose-50/50 w-fit px-2 py-0.5 rounded-full">
                          <ArrowDownRight className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase">IN</span>
                       </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "capitalize font-bold text-[9px] px-2.5 py-0.5 rounded-lg border",
                        inv.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                        inv.status === 'cancelled' ? "bg-slate-100 text-slate-500 border-slate-200" :
                        inv.status === 'overdue' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-amber-50 text-amber-700 border-amber-100"
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900 text-xs py-3">
                     {formatCurrency(inv.total_amount)}
                  </TableCell>
                  <TableCell className="pr-6 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 border-none hover:bg-slate-100 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white min-w-[12rem] p-2 shadow-2xl border-slate-100 rounded-xl">
                        <div className="px-2 py-1.5 mb-1.5 border-b border-slate-50">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manajemen Invoice</p>
                        </div>
                        <DropdownMenuItem 
                          onClick={() => fetchInvoiceDetail(inv.id)}
                          className="cursor-pointer text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                        >
                           <Search className="w-4 h-4 text-slate-400" />
                           Preview & Cetak
                        </DropdownMenuItem>
                        
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(inv.id, 'paid')}
                            className="cursor-pointer text-xs font-bold py-2.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Tandai Sudah Lunas
                          </DropdownMenuItem>
                        )}

                        {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus(inv.id, 'cancelled')}
                            className="cursor-pointer text-xs font-bold py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 flex items-center gap-3"
                          >
                            <X className="w-4 h-4" />
                            Batalkan Tagihan
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem className="cursor-pointer text-xs font-bold py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-3 mt-1.5 border-t border-slate-50">
                           <Receipt className="w-4 h-4" />
                           Hapus Data
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center pb-8 pt-8">
                   <div className="flex flex-col items-center justify-center text-slate-300">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <Receipt className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">Tidak ada invoice ditemukan.</p>
                      <Button variant="link" size="sm" className="text-xs text-indigo-500" onClick={() => { setSearchTerm(''); setFilter('all'); }}>Reset pencarian</Button>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto bg-white p-0 rounded-2xl border-none">
           {selectedInvoice && (
             <div className="flex flex-col h-full">
                <DialogHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
                  <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Preview Invoice</DialogTitle>
                  <Button 
                    onClick={() => window.print()} 
                    size="sm" 
                    className="bg-indigo-600 h-8 text-[10px] font-bold uppercase gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Unduh PDF / Print
                  </Button>
                </DialogHeader>
                
                <div className="flex-1 p-8 md:p-12" id="printable-invoice">
                   {/* Invoice Branding */}
                   <div className="flex justify-between items-start mb-12">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo Perusahaan" className="h-10 w-10 object-contain rounded-xl" />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black">CI</div>
                          )}
                          <div>
                            <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter">{settings.company_name || 'c-invoicer'}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{settings.website || 'Billing System'}</p>
                          </div>
                        </div>
                        <div className="text-slate-500 text-[10px] space-y-1">
                          {settings.address && <p>{settings.address}</p>}
                          {settings.email && <p>{settings.email}</p>}
                          {settings.phone && <p>{settings.phone}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                         <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">INVOICE</h1>
                         <p className="text-xs font-bold text-indigo-600">#{selectedInvoice.invoice_number}</p>
                      </div>
                   </div>

                   {/* Addressees */}
                   <div className="grid grid-cols-2 gap-12 mb-12">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ditagih Ke:</p>
                         <h4 className="text-lg font-black text-slate-900 mb-1">{selectedInvoice.customer_name}</h4>
                         <p className="text-xs text-slate-500 font-medium">{selectedInvoice.customer_email}</p>
                         <p className="text-xs text-slate-500 font-medium max-w-xs">{selectedInvoice.customer_address}</p>
                      </div>
                      <div className="text-right">
                         <div className="space-y-4">
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tgl Terbit</p>
                               <p className="text-xs font-bold text-slate-900">
                                 {new Date(selectedInvoice.issue_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                               </p>
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jatuh Tempo</p>
                               <p className="text-xs font-bold text-rose-600">
                                 {new Date(selectedInvoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Table */}
                   <div className="border-y-2 border-slate-900 py-6 mb-8">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                               <th className="pb-4">Deskripsi Layanan / Item</th>
                               <th className="pb-4 w-20 text-center">Qty</th>
                               <th className="pb-4 w-32 text-right">Harga</th>
                               <th className="pb-4 w-32 text-right">Total</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {selectedInvoice.items?.map((item: any) => (
                               <tr key={item.id}>
                                  <td className="py-4">
                                     <p className="text-sm font-bold text-slate-900">{item.description}</p>
                                  </td>
                                  <td className="py-4 text-center text-sm font-medium text-slate-500">{item.quantity}</td>
                                  <td className="py-4 text-right text-sm font-medium text-slate-500">{formatCurrency(item.unit_price)}</td>
                                  <td className="py-4 text-right text-sm font-black text-slate-900">{formatCurrency(item.total)}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>

                   {/* Footer calculations */}
                   <div className="flex justify-end pt-4">
                      <div className="w-64 space-y-3">
                         <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                            <span>Subtotal</span>
                            <span className="text-slate-900">{formatCurrency(selectedInvoice.total_amount)}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                            <span>Pajak (0%)</span>
                            <span className="text-slate-900">Rp 0</span>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                            <span className="text-xs font-black uppercase tracking-widest">Total Bayar</span>
                            <span className="text-xl font-black text-indigo-600">{formatCurrency(selectedInvoice.total_amount)}</span>
                         </div>
                      </div>
                   </div>

                   {/* Payment Instructions */}
                   <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-end">
                      <div className="space-y-4">
                         <div className="bg-slate-50 p-4 rounded-2xl w-fit">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
                            <p className="text-sm font-black text-indigo-600">{selectedInvoice.payment_method || 'Transfer Bank / Cash'}</p>
                         </div>
                         <p className="text-[10px] text-slate-400 italic">Harap lakukan pembayaran sebelum tanggal jatuh tempo.</p>
                      </div>
                      <div className="text-right opacity-30 grayscale pointer-events-none">
                         <TrendingUp className="w-12 h-12 text-slate-400 ml-auto" />
                         <span className="text-[8px] font-black uppercase tracking-tighter">Verified by c-invoicer</span>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
