"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Pill, MapPin, Loader2, Clock, Plus, Minus, Trash2, AlertTriangle,
  CheckCircle, Zap, History, Package, RefreshCw, Upload, FileText,
  ShieldAlert, X, Search,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface CartItem { name: string; quantity: number; price: number; requiresRx?: boolean; }

interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  deliveryType: string;
  deliveryAddress: string;
  status: string;
  prescriptionUrl?: string | null;
  createdAt: string;
  estimatedDelivery?: string;
  store?: { name: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:           "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ACCEPTED:          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PREPARING:         "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  OUT_FOR_DELIVERY:  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  DELIVERED:         "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// Medicines that require prescription
const RX_REQUIRED_MEDICINES = [
  "amoxicillin", "azithromycin", "ciprofloxacin", "metformin", "atorvastatin",
  "amlodipine", "losartan", "omeprazole", "pantoprazole", "levothyroxine",
  "prednisone", "prednisolone", "diclofenac", "tramadol", "codeine",
  "alprazolam", "diazepam", "lorazepam", "clonazepam", "sertraline",
  "fluoxetine", "escitalopram", "gabapentin", "pregabalin", "insulin",
  "warfarin", "clopidogrel", "metoprolol", "atenolol", "furosemide",
  "hydrochlorothiazide", "lisinopril", "ramipril", "doxycycline",
  "cephalexin", "augmentin", "montelukast", "salbutamol inhaler",
  "beclomethasone", "budesonide", "tacrolimus", "cyclosporine",
];

// Common OTC medicines for quick add
const COMMON_MEDICINES = [
  { name: "Paracetamol 500mg", price: 30 },
  { name: "Ibuprofen 400mg", price: 35 },
  { name: "Cetirizine 10mg", price: 25 },
  { name: "Crocin Advance", price: 40 },
  { name: "Dolo 650", price: 30 },
  { name: "ORS Powder", price: 20 },
  { name: "Vitamin C 500mg", price: 60 },
  { name: "Vitamin D3 1000IU", price: 150 },
  { name: "Calcium + D3", price: 120 },
  { name: "Digene Gel", price: 80 },
  { name: "Vicks VapoRub", price: 99 },
  { name: "Betadine Ointment", price: 75 },
  { name: "Band-Aid Pack", price: 50 },
  { name: "Disprin Tablet", price: 20 },
  { name: "Strepsils Lozenges", price: 45 },
  { name: "Volini Spray", price: 180 },
];

function isRxRequired(name: string): boolean {
  const lower = name.toLowerCase();
  return RX_REQUIRED_MEDICINES.some(rx => lower.includes(rx));
}

export default function MedicineDelivery() {
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [medicineName, setMedicineName] = useState("");
  const [medicinePrice, setMedicinePrice] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; type: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("order");
  const [deliveryType, setDeliveryType] = useState<"EMERGENCY" | "STANDARD">("EMERGENCY");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const hasRxItems = cart.some(item => item.requiresRx);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/medicine/orders");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch { /* silent */ } finally { setOrdersLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const addToCart = (name?: string, price?: number) => {
    const mName = name || medicineName.trim();
    if (!mName) return;
    const mPrice = price || parseFloat(medicinePrice) || 50;
    const rxRequired = isRxRequired(mName);
    const existing = cart.find((c) => c.name.toLowerCase() === mName.toLowerCase());
    if (existing) {
      setCart(cart.map((c) => c.name === existing.name ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { name: mName, quantity: 1, price: mPrice, requiresRx: rxRequired }]);
      if (rxRequired) {
        toast.info(`${mName} requires a valid prescription`, { duration: 4000 });
      }
    }
    if (!name) {
      setMedicineName("");
      setMedicinePrice("");
    }
    toast.success(`${mName} added to cart`);
  };

  const updateQty = (itemName: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.name === itemName ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be under 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, or PDF files are allowed"); return;
    }
    setPrescriptionFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPrescriptionPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else { setPrescriptionPreview(null); }
  };

  const removePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        try {
          const res = await fetch(`http://api.positionstack.com/v1/reverse?access_key=${process.env.NEXT_PUBLIC_GEO_KEY || ""}&query=${lat},${lng}&limit=1`);
          const data = await res.json();
          setDeliveryAddress(data.data?.[0]?.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch { setDeliveryAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); }
        setLocating(false);
      },
      () => { toast.error("Could not detect location"); setLocating(false); }
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error("Add at least one medicine"); return; }
    if (!deliveryAddress.trim()) { toast.error("Please add delivery address"); return; }
    if (hasRxItems && !prescriptionFile) {
      toast.error("Prescription required! Your cart contains medicines that need a valid prescription."); return;
    }
    setLoading(true);
    try {
      let prescriptionUrl: string | undefined;
      if (prescriptionFile) {
        setUploading(true);
        prescriptionUrl = prescriptionPreview || `prescription-${Date.now()}.${prescriptionFile.name.split(".").pop()}`;
        setUploading(false);
      }
      const res = await fetch("/api/medicine/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, deliveryType, deliveryAddress, deliveryLat: location?.lat ?? 0, deliveryLng: location?.lng ?? 0, prescriptionUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setOrderPlaced({ id: data.order.id, type: deliveryType });
      setCart([]);
      removePrescription();
      toast.success(deliveryType === "EMERGENCY" ? "Emergency order placed! Delivery in 10-15 mins" : "Order placed! Delivery in 2 working days");
      await fetchOrders();
    } catch { toast.error("Failed to place order."); }
    finally { setLoading(false); setUploading(false); }
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredCommon = COMMON_MEDICINES.filter(m =>
    !quickSearch || m.name.toLowerCase().includes(quickSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("medicine.order")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("nav.medicine_delivery")}</p>
        </div>
      </div>

      {/* Order / History tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button onClick={() => setActiveTab("order")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === "order" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
          <Pill className="h-3.5 w-3.5" />{t("medicine.order")}
        </button>
        <button onClick={() => { setActiveTab("history"); fetchOrders(); }}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === "history" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
          <History className="h-3.5 w-3.5" />History
          {orders.length > 0 && <span className="ml-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-xs px-1.5">{orders.length}</span>}
        </button>
      </div>

      {/* ===== ORDER TAB ===== */}
      {activeTab === "order" && (
        <div className="space-y-4">
          {/* Delivery Type Toggle */}
          <div className="flex gap-2">
            <button onClick={() => setDeliveryType("EMERGENCY")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                deliveryType === "EMERGENCY" ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}>
              <Zap className="h-4 w-4" />Emergency (15 min)
            </button>
            <button onClick={() => setDeliveryType("STANDARD")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                deliveryType === "STANDARD" ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
              }`}>
              <Clock className="h-4 w-4" />Standard (2 days)
            </button>
          </div>

          {deliveryType === "EMERGENCY" && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">Nearest verified store delivers within 10-15 minutes. Premium charges may apply.</p>
            </div>
          )}

          {/* Add Medicine — manual entry */}
          <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-2"><CardTitle className="text-sm dark:text-white">{t("medicine.add_to_cart")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Medicine Name</Label>
                  <Input
                    ref={nameInputRef}
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToCart(); } }}
                    placeholder="e.g. Paracetamol 500mg"
                    className="mt-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    autoComplete="off"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Price (₹)</Label>
                  <Input
                    value={medicinePrice}
                    onChange={(e) => setMedicinePrice(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToCart(); } }}
                    placeholder="50"
                    className="mt-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    type="number"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => addToCart()} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {medicineName && isRxRequired(medicineName) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />This medicine requires a prescription
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Add — Common Medicines */}
          <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-2"><CardTitle className="text-sm dark:text-white">Quick Add — Popular Medicines</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input value={quickSearch} onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder={t("medicine.search")} className="pl-9 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filteredCommon.map((med) => (
                  <button key={med.name} onClick={() => addToCart(med.name, med.price)}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-700 p-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group">
                    <Pill className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{med.name}</p>
                      <p className="text-[10px] text-gray-400">₹{med.price}</p>
                    </div>
                    <Plus className="h-3 w-3 text-gray-300 group-hover:text-emerald-500 shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          {cart.length > 0 && (
            <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-2"><CardTitle className="text-sm dark:text-white">Your Cart ({cart.length} items)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {cart.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <Pill className={`h-4 w-4 shrink-0 ${item.requiresRx ? "text-amber-500" : "text-emerald-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        {item.requiresRx && (
                          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-[10px] px-1 py-0">Rx</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="icon" className="h-6 w-6 dark:border-gray-700" onClick={() => updateQty(item.name, -1)}>
                        {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-400" /> : <Minus className="h-3 w-3" />}
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold dark:text-white">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6 dark:border-gray-700" onClick={() => updateQty(item.name, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-14 text-right">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">₹{total.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription Upload */}
          {hasRxItems && (
            <Card className={`border-2 ${prescriptionFile ? "border-emerald-300 dark:border-emerald-700" : "border-amber-300 dark:border-amber-700 border-dashed"} dark:bg-gray-900`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />Prescription Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Your cart contains prescription-only medicines. Upload a valid prescription.</p>
                {!prescriptionFile ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload prescription</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, WebP, or PDF (max 5MB)</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
                    <div className="flex items-center gap-3">
                      {prescriptionPreview ? (
                        <img src={prescriptionPreview} alt="Rx" className="h-16 w-16 rounded-lg object-cover border border-emerald-200" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-800">
                          <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate">{prescriptionFile.name}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">{(prescriptionFile.size / 1024).toFixed(0)} KB</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle className="h-3 w-3" />Uploaded</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={removePrescription} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFileSelect} />
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-2"><CardTitle className="text-sm dark:text-white">Delivery Address</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address" className="text-sm flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <Button variant="outline" size="sm" onClick={getLocation} disabled={locating} className="dark:border-gray-700">
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-sky-500" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Success banner */}
          {orderPlaced && (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Order Placed!</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {orderPlaced.type === "EMERGENCY" ? "Delivery in 10-15 mins" : "Delivery in 2 working days"} · #{orderPlaced.id.slice(-8)}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setOrderPlaced(null); setActiveTab("history"); }}
                className="ml-auto text-xs text-green-700 dark:text-green-400">View History</Button>
            </div>
          )}

          {/* Rx warning */}
          {hasRxItems && !prescriptionFile && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">Upload prescription to proceed with Rx medicines.</p>
            </div>
          )}

          {/* Place Order */}
          <Button onClick={placeOrder}
            disabled={loading || uploading || cart.length === 0 || (hasRxItems && !prescriptionFile)}
            className={`w-full h-12 text-sm font-semibold text-white ${deliveryType === "EMERGENCY" ? "bg-red-500 hover:bg-red-600" : "bg-sky-500 hover:bg-sky-600"}`}>
            {loading || uploading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{uploading ? "Uploading..." : "Placing Order..."}</>
              : deliveryType === "EMERGENCY"
                ? <><Zap className="mr-2 h-4 w-4" />Place Emergency Order{cart.length > 0 ? ` — ₹${total.toFixed(0)}` : ""}</>
                : <><Clock className="mr-2 h-4 w-4" />Place Standard Order{cart.length > 0 ? ` — ₹${total.toFixed(0)}` : ""}</>
            }
          </Button>
        </div>
      )}

      {/* ===== HISTORY TAB ===== */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            <Button variant="ghost" size="sm" onClick={fetchOrders} disabled={ordersLoading} className="text-xs gap-1">
              <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-200 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No orders yet</p>
                <Button size="sm" onClick={() => setActiveTab("order")} className="mt-4 bg-sky-500 hover:bg-sky-600 text-white">Place First Order</Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className={`border-gray-100 dark:border-gray-800 dark:bg-gray-900 ${order.deliveryType === "EMERGENCY" ? "border-l-4 border-l-red-400" : "border-l-4 border-l-sky-400"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${order.deliveryType === "EMERGENCY" ? "bg-red-50 dark:bg-red-900/30" : "bg-sky-50 dark:bg-sky-900/30"}`}>
                        {order.deliveryType === "EMERGENCY" ? <Zap className="h-4 w-4 text-red-500" /> : <Package className="h-4 w-4 text-sky-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">#{order.id.slice(-8)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-xs border-0 ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>{order.status.replace(/_/g, " ")}</Badge>
                      {order.deliveryType === "EMERGENCY" && <Badge className="text-xs border-0 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">EMERGENCY</Badge>}
                      {order.prescriptionUrl && <Badge className="text-xs border-0 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 gap-1"><FileText className="h-3 w-3" />Rx</Badge>}
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-2.5 mb-3 space-y-1">
                    {(order.items as CartItem[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><Pill className="h-3 w-3 text-emerald-400" />{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-semibold text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1">
                      <span>Total</span><span>₹{order.totalAmount.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 text-gray-400 shrink-0" /><span className="truncate">{order.deliveryAddress}</span>
                  </div>
                  {order.store && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Fulfilled by: {order.store.name}</p>}
                  {order.estimatedDelivery && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-sky-600 dark:text-sky-400">
                      <Clock className="h-3 w-3" /><span>Est: {new Date(order.estimatedDelivery).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
