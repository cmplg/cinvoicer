import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Tag,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    base_price: 0,
    category: 'service'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal mengambil data jasa/sewa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) {
      toast.error('Nama wajib diisi');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        toast.success('Jasa/Sewa berhasil ditambahkan');
        setIsDialogOpen(false);
        setNewProduct({ name: '', description: '', base_price: 0, category: 'service' });
        fetchProducts();
      }
    } catch (error) {
      toast.error('Gagal menambahkan data');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Data dihapus');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Jasa & Sewa</h2>
          <p className="text-xs text-slate-500">Katalog layanan atau penyewaan produk Anda.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs h-8">
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800">Item Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Nama Layanan/Barang</Label>
                <Input 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="bg-slate-50 border-slate-100 text-xs" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Harga Dasar</Label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</div>
                   <Input 
                    type="number"
                    value={newProduct.base_price}
                    onChange={e => setNewProduct({...newProduct, base_price: parseFloat(e.target.value) || 0})}
                    className="bg-slate-50 border-slate-100 text-xs pl-8" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Kategori</Label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-100 bg-slate-50 px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="service">Jasa (Service)</option>
                  <option value="rental">Sewa (Rental)</option>
                  <option value="product">Produk (Goods)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Keterangan Singkat</Label>
                <textarea 
                  className="w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                  rows={3}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={handleAddProduct} className="bg-indigo-600 hover:bg-indigo-700 text-xs h-9 w-full">Simpan Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input 
          placeholder="Cari jasa atau sewa..." 
          className="pl-8 h-8 text-xs bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
          <Table className="min-w-[600px] lg:min-w-full">
            <TableHeader className="bg-slate-50/50">
            <TableRow className="h-10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <TableHead className="pl-6">Layanan / Item</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga Dasar</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-12">
                   {[...Array(4)].map((_, j) => (
                     <TableCell key={j} className="p-3"><div className="h-3 bg-slate-50 animate-pulse rounded" /></TableCell>
                   ))}
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors h-14 border-slate-50">
                  <TableCell className="p-3 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{p.description || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <Badge variant="secondary" className="capitalize text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0 rounded">
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 text-right font-extrabold text-slate-800 text-xs">
                     {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.base_price)}
                  </TableCell>
                  <TableCell className="p-3 pr-6 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(p.id)}
                      className="h-7 w-7 p-0 text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                   <div className="flex flex-col items-center justify-center text-slate-300">
                      <Tag className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-xs">Belum ada katalog jasa/sewa.</p>
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
