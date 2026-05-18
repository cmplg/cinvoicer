import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Keuangan</h2>
        <p className="text-xs text-slate-400">Analisa performa bisnis Anda secara mendalam.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-800">Laporan Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">Fitur laporan grafik mendalam sedang dalam pengembangan.</p>
            <div className="h-32 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}