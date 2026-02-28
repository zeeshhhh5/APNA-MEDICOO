"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pill, Plus, AlertTriangle, Search, Loader2, Package } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  genericName?: string | null;
  category: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  requiresPrescription: boolean;
  isActive: boolean;
}

// Default medicines database
const DEFAULT_MEDICINES = [
  { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "TABLET", price: 5, requiresPrescription: false },
  { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "TABLET", price: 8, requiresPrescription: false },
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "CAPSULE", price: 15, requiresPrescription: true },
  { name: "Azithromycin 250mg", genericName: "Azithromycin", category: "TABLET", price: 25, requiresPrescription: true },
  { name: "Cetirizine 10mg", genericName: "Cetirizine", category: "TABLET", price: 3, requiresPrescription: false },
  { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "CAPSULE", price: 12, requiresPrescription: false },
  { name: "Metformin 500mg", genericName: "Metformin", category: "TABLET", price: 6, requiresPrescription: true },
  { name: "Atorvastatin 10mg", genericName: "Atorvastatin", category: "TABLET", price: 18, requiresPrescription: true },
  { name: "Aspirin 75mg", genericName: "Acetylsalicylic Acid", category: "TABLET", price: 4, requiresPrescription: false },
  { name: "Vitamin D3 1000IU", genericName: "Cholecalciferol", category: "CAPSULE", price: 10, requiresPrescription: false },
  { name: "Cough Syrup", genericName: "Dextromethorphan", category: "SYRUP", price: 45, requiresPrescription: false },
  { name: "Insulin Glargine", genericName: "Insulin", category: "INJECTION", price: 850, requiresPrescription: true },
  { name: "Salbutamol Inhaler", genericName: "Albuterol", category: "INHALER", price: 120, requiresPrescription: true },
  { name: "Diclofenac Gel", genericName: "Diclofenac", category: "OINTMENT", price: 65, requiresPrescription: false },
  { name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin", category: "TABLET", price: 20, requiresPrescription: true },
  { name: "Ranitidine 150mg", genericName: "Ranitidine", category: "TABLET", price: 7, requiresPrescription: false },
  { name: "Multivitamin", genericName: "Multivitamin", category: "TABLET", price: 15, requiresPrescription: false },
  { name: "Calcium + Vitamin D", genericName: "Calcium Carbonate", category: "TABLET", price: 12, requiresPrescription: false },
  { name: "Losartan 50mg", genericName: "Losartan", category: "TABLET", price: 22, requiresPrescription: true },
  { name: "Amlodipine 5mg", genericName: "Amlodipine", category: "TABLET", price: 14, requiresPrescription: true },
];

export default function StoreInventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState(DEFAULT_MEDICINES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", genericName: "", category: "TABLET", price: "", quantity: "", lowStockThreshold: "10" });

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await fetch("/api/medical-store/inventory");
        const data = await res.json();
        if (data.medicines && data.medicines.length > 0) {
          setMedicines(data.medicines);
        } else {
          // Auto-seed medicines on first load if inventory is empty
          try {
            await fetch("/api/medical-store/seed-medicines", { method: "POST" });
            const seededRes = await fetch("/api/medical-store/inventory");
            const seededData = await seededRes.json();
            if (seededData.medicines) setMedicines(seededData.medicines);
          } catch {
            // silent — user can add manually
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, []);

  const addToInventory = async (medicine: typeof DEFAULT_MEDICINES[0], quantity: number) => {
    try {
      const res = await fetch("/api/medical-store/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: medicine.name, 
          genericName: medicine.genericName, 
          category: medicine.category, 
          price: medicine.price, 
          quantity, 
          lowStockThreshold: 10,
          requiresPrescription: medicine.requiresPrescription,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMedicines((prev) => [data.medicine, ...prev]);
      toast.success(`${medicine.name} added to inventory!`);
    } catch { 
      toast.error("Failed to add medicine"); 
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.quantity) { toast.error("Fill all required fields"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/medical-store/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity), lowStockThreshold: parseInt(form.lowStockThreshold) }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMedicines((prev) => [data.medicine, ...prev]);
      setShowAdd(false);
      setForm({ name: "", genericName: "", category: "TABLET", price: "", quantity: "", lowStockThreshold: "10" });
      toast.success("Medicine added to inventory!");
    } catch { toast.error("Failed to add medicine"); }
    finally { setAdding(false); }
  };

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.genericName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const lowStock = medicines.filter((m) => m.quantity <= m.lowStockThreshold && m.isActive);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500">{medicines.length} medicines · {lowStock.length} low stock</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBrowse(true)} size="sm" variant="outline" className="gap-1.5">
            <Package className="h-3.5 w-3.5" /> Browse Medicines
          </Button>
          <Button onClick={() => setShowAdd(true)} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Custom
          </Button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 p-3">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-700">{lowStock.length} medicine(s) are low on stock: {lowStock.map((m) => m.name).join(", ")}</p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No medicines in inventory</p>
          <Button onClick={() => setShowAdd(true)} size="sm" className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">Add First Medicine</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((med) => (
            <Card key={med.id} className="border-gray-100">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Pill className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{med.name}</p>
                    {med.quantity <= med.lowStockThreshold && (
                      <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">Low Stock</Badge>
                    )}
                    {med.requiresPrescription && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Rx</Badge>
                    )}
                  </div>
                  {med.genericName && <p className="text-xs text-gray-400 truncate">{med.genericName}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">₹{med.price}</p>
                  <p className={`text-xs ${med.quantity <= med.lowStockThreshold ? "text-orange-500 font-semibold" : "text-gray-400"}`}>
                    Qty: {med.quantity}
                  </p>
                </div>
                <Badge className="bg-gray-100 text-gray-600 border-0 text-xs shrink-0">{med.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showBrowse} onOpenChange={setShowBrowse}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Browse Medicines Database</DialogTitle>
            <p className="text-sm text-gray-500">Click + to add medicine to your inventory</p>
          </DialogHeader>
          <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
            {availableMedicines.map((med, idx) => (
              <Card key={idx} className="border-gray-100">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Pill className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{med.name}</p>
                      {med.requiresPrescription && (
                        <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Rx</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{med.genericName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">₹{med.price}</p>
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs mt-1">{med.category}</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const qty = prompt(`Enter quantity for ${med.name}:`, "50");
                      if (qty && !isNaN(parseInt(qty))) {
                        addToInventory(med, parseInt(qty));
                      }
                    }}
                    className="h-8 w-8 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Medicine</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Medicine Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="e.g. Paracetamol 500mg" /></div>
            <div><Label className="text-xs">Generic Name</Label><Input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} className="mt-1" placeholder="e.g. Acetaminophen" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Price (₹) *</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" className="mt-1" /></div>
              <div><Label className="text-xs">Quantity *</Label><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} type="number" className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Low Stock Alert Threshold</Label><Input value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} type="number" className="mt-1" /></div>
            <Button onClick={handleAdd} disabled={adding} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><Plus className="mr-2 h-4 w-4" />Add Medicine</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
