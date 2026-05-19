import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const data = [
  { name: 'Jan', sales: 4000, purchases: 2400 },
  { name: 'Feb', sales: 3000, purchases: 1398 },
  { name: 'Mar', sales: 2000, purchases: 9800 },
  { name: 'Apr', sales: 2780, purchases: 3908 },
  { name: 'May', sales: 1890, purchases: 4800 },
  { name: 'Jun', sales: 2390, purchases: 3800 },
];

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    customers: 0,
    projects: 0,
    chart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices').then(res => res.json()),
      fetch('/api/stats').then(res => res.json())
    ]).then(([invoicesData, statsData]) => {
      setInvoices(invoicesData.slice(0, 5));
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-xs text-slate-400">Selamat datang kembali! Berikut ringkasan keuangan perusahaan.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => window.location.href = '/invoices?status=paid'} className="border-none shadow-md bg-white cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 sm:px-4 py-3">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cair</CardTitle>
            <div className="bg-emerald-50 p-1.5 rounded-md">
               <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(stats.revenue)}</div>
            <p className="text-[9px] text-emerald-600 mt-0.5 font-bold">Lunas Terbayar</p>
          </CardContent>
        </Card>
        <Card onClick={() => window.location.href = '/invoices?filter=outstanding'} className="border-none shadow-md bg-white cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 sm:px-4 py-3">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding</CardTitle>
            <div className="bg-amber-50 p-1.5 rounded-md">
               <Clock className="h-3.5 w-3.5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(stats.pending)}</div>
            <p className="text-[9px] text-amber-600 mt-0.5 font-bold">Dalam Penagihan</p>
          </CardContent>
        </Card>
        <Card onClick={() => window.location.href = '/customers'} className="border-none shadow-md bg-white cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 sm:px-4 py-3">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Klien</CardTitle>
            <div className="bg-indigo-50 p-1.5 rounded-md">
               <ArrowUpRight className="h-3.5 w-3.5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight">{stats.customers}</div>
            <p className="text-[9px] text-indigo-600 mt-0.5 font-bold">Aktif Terdaftar</p>
          </CardContent>
        </Card>
        <Card onClick={() => window.location.href = '/invoices?filter=sent'} className="border-none shadow-md bg-white cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-1 px-3 sm:px-4 py-3">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktif Invoice</CardTitle>
            <div className="bg-slate-50 p-1.5 rounded-md">
               <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4">
            <div className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight">{stats.projects}</div>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">Status 'Sent'</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart */}
        <Card className="lg:col-span-4 border-none shadow-md bg-white">
          <CardHeader className="px-6 pt-5 pb-2">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Performa Pembayaran (6 Bln terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chart}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `Rp ${value/1000000}jt`}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ fontSize: '12px', borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-3 border-none shadow-md bg-white">
          <CardHeader className="px-6 pt-5 pb-2">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Invoice Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-50 animate-pulse rounded" />
                ))}
              </div>
            ) : invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-50">
                    <TableHead className="text-[10px] text-slate-400 h-8 font-bold uppercase">Invoice</TableHead>
                    <TableHead className="text-[10px] text-slate-400 h-8 font-bold uppercase">Status</TableHead>
                    <TableHead className="text-right text-[10px] text-slate-400 h-8 font-bold uppercase">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group h-12">
                      <TableCell className="p-2">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{inv.invoice_number}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">{inv.customer_name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "capitalize font-bold text-[8px] px-1 py-0.5 rounded",
                            inv.status === 'paid' ? "bg-emerald-50 text-emerald-700" : 
                            inv.status === 'overdue' ? "bg-rose-50 text-rose-700" :
                            "bg-amber-50 text-amber-700"
                          )}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right p-2 text-xs font-bold text-slate-800">
                        {formatCurrency(inv.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-slate-200" />
                </div>
                <p className="text-slate-400 text-[11px]">Belum ada data invoice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
