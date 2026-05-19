import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '', is_vendor: false });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [type, setType] = useState('sale');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 }
  ]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));
    
    fetch('/api/payment-methods')
      .then(res => res.json())
      .then(data => {
        setPaymentMethods(data);
        if (data.length > 0) setSelectedPaymentMethod(data[0].name || '');
      });

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  useEffect(() => {
    // when selecting customer by id, populate customer form
    const c = customers.find((x: any) => x.id?.toString() === selectedCustomerId);
    if (c) {
      setCustomerForm({ name: c.name || '', email: c.email || '', phone: c.phone || '', address: c.address || '', is_vendor: !!c.is_vendor });
      setCustomerNameInput(c.name || '');
    }
  }, [selectedCustomerId, customers]);

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      tax_rate: 0, 
      total: 0 
    }]);
  };

  const pickProduct = (itemId: string, product: any) => {
    // Update multiple fields for the same item
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const subtotal = item.quantity * parseFloat(product.base_price);
        const taxAmount = subtotal * (item.tax_rate / 100);
        return { 
          ...item, 
          description: product.name, 
          unit_price: parseFloat(product.base_price) || 0,
          total: subtotal + taxAmount
        };
      }
      return item;
    });
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        const subtotal = updatedItem.quantity * updatedItem.unit_price;
        const taxAmount = subtotal * (updatedItem.tax_rate / 100);
        updatedItem.total = subtotal + taxAmount;
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const updateItemDescription = (id: string, description: string) => {
    const product = products.find((p: any) => p.name === description);
    const newItems = items.map(item => {
      if (item.id !== id) return item;
      const unit_price = product ? parseFloat(product.base_price) || item.unit_price : item.unit_price;
      const subtotal = item.quantity * unit_price;
      const taxAmount = subtotal * (item.tax_rate / 100);
      return {
        ...item,
        description,
        unit_price,
        total: subtotal + taxAmount,
      };
    });
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const calculateTax = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tax_rate / 100)), 0);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const ensureCustomerExists = async () => {
    if (selectedCustomerId) return parseInt(selectedCustomerId);
    const existing = customers.find((c: any) => c.name?.toLowerCase() === customerNameInput.trim().toLowerCase());
    if (existing) return existing.id;
    const payload = { ...customerForm, name: customerNameInput || customerForm.name };
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(prev => [...prev, data]);
        return data.id;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleSave = async () => {
    const customerId = await ensureCustomerExists();
    if (!customerId) {
      toast.error('Mohon tambahkan atau pilih pelanggan.');
      return;
    }
    
    const payload = {
      invoice_number: invoiceNumber,
      customer_id: customerId,
      issue_date: issueDate,
      due_date: dueDate || null,
      status: 'sent',
      type,
      total_amount: calculateTotal(),
      payment_method: selectedPaymentMethod,
      items: items.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate,
        total: i.total
      }))
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Invoice berhasil disimpan!');
        navigate('/invoices');
      } else {
        const err = await res.json();
        toast.error(`Gagal: ${err.error}`);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-full sm:w-auto text-slate-400 hover:text-slate-900 text-xs justify-start px-0">
           <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
           <span>Kembali</span>
        </Button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-slate-200 text-xs h-8">Draft</Button>
           <Button size="sm" onClick={handleSave} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-xs h-8">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Simpan & Kirim
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info */}
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Detail Invoice</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 pb-5">
              <div className="space-y-1">
                <Label htmlFor="inv-no" className="text-[10px] font-bold text-slate-400 uppercase">Nomor Invoice</Label>
                <Input id="inv-no" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="h-8 text-xs bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Tipe Invoice</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="sale" className="text-xs">Penjualan (Keluar)</SelectItem>
                    <SelectItem value="purchase" className="text-xs">Pembelian (Masuk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="customer" className="text-[10px] font-bold text-slate-400 uppercase">Pelanggan / Vendor</Label>
                <Input
                  id="customer"
                  placeholder="Pilih pelanggan atau ketik nama baru"
                  list="customer-options"
                  className="h-8 text-xs bg-slate-50 border-slate-100"
                  value={customerNameInput}
                  onChange={(e) => { setCustomerNameInput(e.target.value); setSelectedCustomerId(''); setCustomerForm({...customerForm, name: e.target.value}); }}
                />
                <datalist id="customer-options">
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                <p className="text-[9px] text-slate-400">Ketik untuk menambah pelanggan baru secara otomatis.</p>
              </div>

              {/* Inline customer info form */}
              <div className="col-span-1 sm:col-span-2 grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Email Pelanggan</Label>
                    <Input value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} className="h-8 text-xs bg-slate-50 border-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Telepon</Label>
                    <Input value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="h-8 text-xs bg-slate-50 border-slate-100" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Alamat</Label>
                  <Input value={customerForm.address} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} className="h-8 text-xs bg-slate-50 border-slate-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Terbit</Label>
                  <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="h-8 text-xs bg-slate-50 border-slate-100" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Acara</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-8 text-xs bg-slate-50 border-slate-100" />
                </div>
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-100">
                    <SelectValue placeholder="Pilih metode..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {paymentMethods.map((pm: any) => (
                      <SelectItem key={pm.id} value={pm.name} className="text-xs">{pm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 px-5 py-3">
               <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Daftar Item</CardTitle>
               <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-[10px] font-bold text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50">
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Tambah Item</span>
               </Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <Table className="min-w-[600px] lg:min-w-full">
                    <TableHeader className="bg-transparent">
                    <TableRow className="hover:bg-transparent border-slate-50 h-8">
                      <TableHead className="pl-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi</TableHead>
                      <TableHead className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty</TableHead>
                      <TableHead className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga</TableHead>
                      <TableHead className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax %</TableHead>
                      <TableHead className="text-right pr-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/20 transition-colors h-10">
                        <TableCell className="pl-5 py-2">
                           <div className="flex items-center gap-1">
                             <div className="flex flex-col gap-1">
                             <Select value={products.find((p:any)=>p.name===item.description) ? item.description : (item.description ? '__manual__' : '')} onValueChange={(val)=>{
                               if (val === '__manual__') {
                                 updateItem(item.id, 'description', '');
                               } else {
                                 const p = products.find((pr:any)=>pr.name===val);
                                 if (p) pickProduct(item.id, p);
                               }
                             }}>
                               <SelectTrigger className="h-6 text-xs bg-transparent border-none p-0 text-left">
                                 <SelectValue placeholder="Pilih item..." />
                               </SelectTrigger>
                               <SelectContent className="bg-white">
                                 {products.map((product: any) => (
                                   <SelectItem key={product.id} value={product.name} className="text-xs">{product.name}</SelectItem>
                                 ))}
                                 <SelectItem value="__manual__" className="text-xs">-- Masukkan Manual --</SelectItem>
                               </SelectContent>
                             </Select>
                             {(!products.find((p:any)=>p.name===item.description)) && (
                               <>
                                 <Input
                                   placeholder="Deskripsi manual"
                                   value={item.description}
                                   onChange={(e) => updateItemDescription(item.id, e.target.value)}
                                   className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs font-medium"
                                 />
                                 <p className="text-[9px] text-slate-400">Pilih layanan dari daftar atau masukkan manual.</p>
                               </>
                             )}
                          </div>
                           </div>
                        </TableCell>
                        <TableCell className="py-2">
                           <Input 
                            type="number"
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs text-center font-medium"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                           />
                        </TableCell>
                        <TableCell className="py-2">
                           <Input 
                            type="number"
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs font-medium"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                           />
                        </TableCell>
                        <TableCell className="py-2">
                           <Input 
                            type="number"
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-6 text-xs text-center font-medium"
                            value={item.tax_rate}
                            onChange={(e) => updateItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                           />
                        </TableCell>
                        <TableCell className="text-right pr-5 py-2 font-bold text-slate-700 text-xs">
                           {new Intl.NumberFormat('id-ID').format(item.total)}
                        </TableCell>
                        <TableCell className="pr-5 py-2 text-right">
                           <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          title="Hapus item"
                          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-0 h-6 w-6"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
           <Card className="border-none shadow-lg bg-white sticky top-20">
              <CardHeader className="px-5 pt-4 pb-2">
                 <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                 <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculateSubtotal())}</span>
                 </div>
                 <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Pajak Total</span>
                    <span className="text-slate-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculateTax())}</span>
                 </div>
                 <Separator className="bg-slate-50" />
                 <div className="flex flex-col gap-1 py-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Akhir</span>
                    <span className="text-xl font-black text-indigo-600 tracking-tight">
                       {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculateTotal())}
                    </span>
                 </div>

                 <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-50 mt-2 space-y-1.5 transition-all hover:bg-indigo-50/50">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
                       <HelpCircle className="w-3 h-3" />
                       Peringatan
                    </div>
                    <p className="text-[10px] text-indigo-600/80 leading-relaxed font-medium">
                       Data akan langsung masuk ke database sebagai status 'Sent' setelah disimpan.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
