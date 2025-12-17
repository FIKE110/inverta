import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { 
  Sun, Zap, TrendingUp, CheckCircle, ArrowRight, Battery, 
  Download, BarChart3, Users, Settings, LogOut, Copy, Menu, 
  X, ChevronRight, Leaf, Plus, Minus, Search, Smartphone, 
  Monitor, Wind, Thermometer, Share2, Upload, Palette,
  Loader2, Check, AlertCircle, MessageCircle
} from 'lucide-react';

// --- UTILS & SHARED COMPONENTS ---

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Custom formatted currency
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

// --- TOAST SYSTEM (SONNER-STYLE SIMULATION) ---
// Included directly to ensure standalone functionality without npm install
type ToastType = 'success' | 'error' | 'loading' | 'default';
type Toast = { id: string; type: ToastType; message: string; description?: string };

const ToastContext = createContext<{ addToast: (t: Omit<Toast, 'id'>) => void } | null>(null);

const Toaster = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent<Omit<Toast, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { ...e.detail, id }]);
      if (e.detail.type !== 'loading') {
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
      }
    };
    window.addEventListener('inverta-toast' as any, handleToast as any);
    return () => window.removeEventListener('inverta-toast' as any, handleToast as any);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto min-w-[300px] max-w-[400px] animate-in slide-in-from-bottom-5 fade-in duration-300 bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex items-start gap-3">
          <div className="mt-0.5">
            {t.type === 'loading' && <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />}
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t.message}</div>
            {t.description && <div className="text-xs text-slate-500 mt-1">{t.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Toast Utility API
const toast = {
  success: (message: string, description?: string) => window.dispatchEvent(new CustomEvent('inverta-toast', { detail: { type: 'success', message, description } })),
  error: (message: string, description?: string) => window.dispatchEvent(new CustomEvent('inverta-toast', { detail: { type: 'error', message, description } })),
  loading: (message: string) => window.dispatchEvent(new CustomEvent('inverta-toast', { detail: { type: 'loading', message } })),
  // Mock promise handler
  promise: async (promise: Promise<any>, { loading, success, error }: { loading: string; success: string; error: string }) => {
    toast.loading(loading);
    try {
      await promise;
      // In a real app we'd remove the loading toast specifically, here we just push success
      toast.success(success);
    } catch (e) {
      toast.error(error);
    }
  }
};

// --- BASIC COMPONENTS ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'accent' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--primary)] text-white hover:opacity-90 shadow-sm border-transparent', 
      outline: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 border',
      ghost: 'text-slate-600 hover:bg-slate-100 bg-transparent border-transparent',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 border-transparent',
      accent: 'bg-lime-400 text-green-950 hover:bg-lime-500 border-transparent font-bold', 
    };
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]', variants[variant], className)}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-shadow', className)}
      {...props}
    />
  )
);

const Card = ({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) => (
  <div onClick={onClick} className={cn("rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow", className)}>
    {children}
  </div>
);

// --- DATA TYPES & LOGIC ---

type Branding = {
  primaryColor: string;
  accentColor: string;
  companyName: string;
  tagline: string;
  logo: string | null;
};

type User = { id: string; name: string; email: string; companyName: string };
type Lead = { id: string; name: string; email: string; phone: string; consumption: number; systemSize: string; totalCost: number; status: 'New' | 'Contacted' | 'Closed'; date: string };
type CatalogItem = { id: string; name: string; type: 'panel' | 'inverter' | 'battery' | 'installation'; price: number; spec: number; unit: string };

type Appliance = { id: string; name: string; watts: number; defaultHours: number; icon: React.ReactNode };
type SelectedAppliance = Appliance & { count: number; hours: number };

const DEFAULT_BRANDING: Branding = {
  primaryColor: '#14532d', // green-900
  accentColor: '#a3e635', // lime-400
  companyName: 'Inverta Demo',
  tagline: 'Solar Configurator',
  logo: null
};

const COMMON_APPLIANCES: Appliance[] = [
  { id: 'bulb', name: 'LED Light Bulb', watts: 10, defaultHours: 8, icon: <Zap className="w-4 h-4"/> },
  { id: 'fan', name: 'Ceiling Fan', watts: 75, defaultHours: 12, icon: <Wind className="w-4 h-4"/> },
  { id: 'tv', name: 'LED TV (40-55")', watts: 100, defaultHours: 6, icon: <Monitor className="w-4 h-4"/> },
  { id: 'laptop', name: 'Laptop / Phone', watts: 65, defaultHours: 10, icon: <Smartphone className="w-4 h-4"/> },
  { id: 'fridge', name: 'Refrigerator', watts: 200, defaultHours: 16, icon: <Thermometer className="w-4 h-4"/> },
  { id: 'freezer', name: 'Deep Freezer', watts: 250, defaultHours: 12, icon: <Thermometer className="w-4 h-4"/> },
  { id: 'ac1', name: 'Inverter AC (1HP)', watts: 1000, defaultHours: 8, icon: <Wind className="w-4 h-4"/> },
  { id: 'pump', name: 'Water Pump (Sumo)', watts: 750, defaultHours: 1, icon: <Zap className="w-4 h-4"/> },
];

const DEFAULT_CATALOG: CatalogItem[] = [
  { id: '1', name: 'Jinko Solar Tiger Pro (550W)', type: 'panel', price: 85000, spec: 550, unit: 'W' },
  { id: '2', name: 'Growatt Hybrid Inverter (5kVA)', type: 'inverter', price: 650000, spec: 5000, unit: 'VA' },
  { id: '3', name: 'Felicity Lithium Battery (5kWh)', type: 'battery', price: 1200000, spec: 5000, unit: 'Wh' },
  { id: '4', name: 'Mounting & Install Kit', type: 'installation', price: 150000, spec: 1, unit: 'Lot' },
];

const calculateSolarSystem = (monthlyBill: number, fuelCost: number, appliances: SelectedAppliance[], catalog: CatalogItem[]) => {
  let dailyWh = 0;
  let peakWatts = 0;

  appliances.forEach(app => {
    dailyWh += app.watts * app.count * app.hours;
    peakWatts += app.watts * app.count;
  });

  const diversityFactor = 0.7;
  const designedPeakLoad = peakWatts * diversityFactor;

  const requiredInverterSize = designedPeakLoad * 1.2;
  const inverter = catalog.find(i => i.type === 'inverter' && i.spec >= requiredInverterSize) || catalog.find(i => i.type === 'inverter');
  const inverterCount = Math.ceil(requiredInverterSize / (inverter?.spec || 5000));

  const requiredStorageWh = dailyWh * 0.6;
  const battery = catalog.find(i => i.type === 'battery');
  const batteryCount = Math.ceil(requiredStorageWh / (battery?.spec || 4800));

  const requiredPanelPower = (dailyWh / 4.5) * 1.3;
  const panel = catalog.find(i => i.type === 'panel');
  const panelCount = Math.ceil(requiredPanelPower / (panel?.spec || 550));

  const equipmentCost = 
    (inverterCount * (inverter?.price || 0)) +
    (batteryCount * (battery?.price || 0)) +
    (panelCount * (panel?.price || 0));
  
  const installCost = (catalog.find(i => i.type === 'installation')?.price || 150000);
  const totalCost = equipmentCost + installCost;

  const annualGridCost = monthlyBill * 12;
  const annualFuelCost = fuelCost * 12;
  const totalAnnualSavings = annualGridCost + (annualFuelCost * 0.9);
  const co2Saved = dailyWh * 0.4 * 365 / 1000;

  return {
    system: { inverterCount, batteryCount, panelCount, inverter, battery, panel },
    financials: { totalCost, totalAnnualSavings, roiYears: totalCost / totalAnnualSavings },
    impact: { co2Saved },
    details: { dailyWh, designedPeakLoad }
  };
};

// --- GLOBAL STATE ---

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  catalog: CatalogItem[];
  leads: Lead[];
  branding: Branding;
  route: string;
  navigate: (path: string) => void;
  login: (email: string) => void;
  logout: () => void;
  updateCatalog: (items: CatalogItem[]) => void;
  updateBranding: (branding: Branding) => void;
  addLead: (lead: Lead) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// --- PAGES ---

// 1. LANDING PAGE (ENHANCED & FULLER)
const LandingPage = () => {
  const { navigate } = useContext(AppContext)!;
  
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-slate-900 selection:bg-lime-200" style={{'--primary': '#14532d'} as React.CSSProperties}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-green-950">
            <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-900 fill-current" />
            </div>
            Inverta.
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <button className="text-sm font-medium text-slate-600 hover:text-green-900">For Installers</button>
            <button className="text-sm font-medium text-slate-600 hover:text-green-900">Case Studies</button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-green-900 hover:underline">Log in</button>
            <Button onClick={() => navigate('/calculator')} variant="primary" className="rounded-full shadow-lg shadow-green-900/10">Start Project</Button>
          </div>
          <button className="md:hidden p-2"><Menu/></button>
        </div>
      </nav>

      {/* Asymmetrical Hero */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 container mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              Now live in Lagos, Abuja & Port Harcourt
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-green-950 leading-[1.1] mb-8">
              Solar quotes <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-green-600">based on physics,</span> not guesses.
            </h1>
            <p className="text-xl text-slate-600 max-w-xl mb-10 leading-relaxed">
              Inverta replaces messy spreadsheets with an intelligent operating system for next-gen energy installers. Generate accurate, appliance-level sizing proposals in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button onClick={() => navigate('/login')} variant="primary" className="h-14 px-8 text-lg rounded-full">Installer Dashboard</Button>
              <Button onClick={() => navigate('/calculator')} variant="outline" className="h-14 px-8 text-lg rounded-full">Try the Calculator</Button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"/>)}
               </div>
               <div>Trusted by 500+ Installers</div>
            </div>
          </div>
          
          {/* Abstract/Offset Visual */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Sun className="w-5 h-5 text-green-700"/></div>
                    <div>
                      <div className="font-bold text-slate-900">System Proposal</div>
                      <div className="text-xs text-slate-500">Lekki Phase 1, Lagos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₦3.2M</div>
                    <div className="text-xs text-slate-400">Total Cost</div>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">Daily Load</span>
                    <span className="text-sm font-bold">18.5 kWh</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <span className="text-sm font-medium">ROI Period</span>
                    <span className="text-sm font-bold">2.4 Years</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-lime-500 w-[75%]"></div>
                  </div>
                  <div className="text-xs text-slate-400 text-center mt-2">Energy Independence Score: 75%</div>
               </div>
            </div>
            <div className="absolute top-10 -right-8 w-64 h-64 bg-lime-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-green-950 mb-4">The new standard for solar sales.</h2>
                <p className="text-slate-600">Move from "guesstimates" to physics-based engineering in a single click.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Define Your Catalog", desc: "Upload your inventory (Panels, Inverters, Batteries) and set your markup rates per watt.", icon: Settings },
                    { title: "Share Your Link", desc: "Send your branded calculator link to clients via WhatsApp or embed it on your website.", icon: Share2 },
                    { title: "Close Automatically", desc: "Clients input appliances, you get a fully-sized engineering proposal instantly.", icon: CheckCircle },
                ].map((item, i) => (
                    <Card key={i} className="p-8 border-none bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center mb-6 text-green-800">
                            <item.icon className="w-6 h-6"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Asymmetrical Stats Section */}
      <section className="py-24 bg-slate-900 text-white border-y border-slate-800">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12">
             <div className="md:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-lime-400 mb-2">Our Mission</h3>
                <p className="text-2xl font-semibold text-white/90">Accelerating Africa's transition to decentralized renewable energy.</p>
             </div>
             <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-8 border-l border-slate-700 pl-8">
                <div>
                   <div className="text-4xl font-extrabold text-lime-500 mb-1">SDG 7</div>
                   <div className="text-sm font-medium text-slate-400">Clean Energy</div>
                </div>
                <div>
                   <div className="text-4xl font-extrabold text-lime-500 mb-1">SDG 13</div>
                   <div className="text-sm font-medium text-slate-400">Climate Action</div>
                </div>
                <div>
                   <div className="text-4xl font-extrabold text-lime-500 mb-1">98%</div>
                   <div className="text-sm font-medium text-slate-400">Sizing Accuracy</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-500 py-20 px-6 border-t border-slate-200">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="text-green-950 text-2xl font-bold mb-6 flex items-center gap-2">
               <div className="w-6 h-6 bg-lime-500 rounded-full"></div> Inverta.
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Lagos, Nigeria.<br/>
              Building the digital infrastructure for solar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
             <div>
                <h4 className="text-slate-900 font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><button className="hover:text-green-700">Installers</button></li>
                  <li><button className="hover:text-green-700">Calculator</button></li>
                  <li><button className="hover:text-green-700">Pricing</button></li>
                </ul>
             </div>
             <div>
                <h4 className="text-slate-900 font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><button className="hover:text-green-700">About</button></li>
                  <li><button className="hover:text-green-700">Careers</button></li>
                  <li><button className="hover:text-green-700">Contact</button></li>
                </ul>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 2. AUTH PAGE
const AuthPage = () => {
  const { login, navigate } = useContext(AppContext)!;
  const [email, setEmail] = useState('installer@solar.ng');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async auth
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Verifying credentials...',
        success: 'Welcome back!',
        error: 'Login failed'
      }
    ).then(() => {
        login(email);
        navigate('/dashboard');
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9] p-4" style={{'--primary': '#14532d'} as React.CSSProperties}>
      <Card className="w-full max-w-[400px] p-10 shadow-xl border-none">
        <div className="flex justify-start mb-8">
           <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center shadow-lg shadow-lime-200">
              <Zap className="w-5 h-5 text-green-900 fill-current" />
           </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-green-950">Welcome back.</h1>
        <p className="mb-8 text-sm text-slate-500">Log in to manage your leads and catalog.</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Work Email</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Sign In'}
          </Button>
        </form>
        <button onClick={() => navigate('/')} className="mt-8 text-xs text-slate-400 hover:text-green-900 w-full text-center">← Back to Inverta</button>
      </Card>
    </div>
  );
};

// 3. DASHBOARD PAGE
const DashboardPage = () => {
  const { user, leads, catalog, branding, updateCatalog, updateBranding, logout, navigate } = useContext(AppContext)!;
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'catalog' | 'branding'>('overview');

  // SUB-COMPONENT: CATALOG
  const CatalogEditor = () => {
    const [items, setItems] = useState(catalog);
    const handleSave = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            { loading: 'Updating catalog...', success: 'Catalog prices updated', error: 'Failed to update' }
        ).then(() => updateCatalog(items));
    };
    
    const handleChange = (id: string, field: keyof CatalogItem, val: string | number) => {
      const newItems = items.map(i => i.id === id ? { ...i, [field]: val } : i);
      setItems(newItems as CatalogItem[]);
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Pricing Catalog</h2>
                <p className="text-sm text-slate-500">Manage your base rates for automatic quotes.</p>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-semibold text-slate-600">Component</th>
                        <th className="p-4 font-semibold text-slate-600">Capacity / Spec</th>
                        <th className="p-4 font-semibold text-slate-600">Unit Price (₦)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-medium text-slate-900">
                                {item.name}
                                <div className="text-xs text-slate-400 capitalize">{item.type}</div>
                            </td>
                            <td className="p-4 text-slate-500">{item.spec} {item.unit}</td>
                            <td className="p-4"><Input type="number" className="w-40 h-10" value={item.price} onChange={e => handleChange(item.id, 'price', Number(e.target.value))} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  // SUB-COMPONENT: LEADS
  const LeadsList = () => (
      <div className="space-y-4 animate-in fade-in duration-500 max-w-4xl">
        <h2 className="text-xl font-bold text-slate-900">Leads Pipeline</h2>
        {leads.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-xl">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Users className="text-slate-400 w-6 h-6"/>
                </div>
                <h3 className="text-slate-900 font-medium">Your pipeline is empty</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Share your public calculator link to potential clients to start generating accurate leads.</p>
            </div>
        ) : (
            <div className="grid gap-3">
                {leads.map(lead => (
                    <Card key={lead.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-green-500/50 cursor-pointer group transition-all">
                        <div className="mb-4 md:mb-0">
                            <div className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                {lead.name}
                                {lead.status === 'New' && <span className="px-2 py-0.5 rounded-full bg-lime-100 text-green-800 text-[10px] uppercase font-bold tracking-wide">New</span>}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                <Zap className="w-3 h-3"/> {lead.systemSize} System
                                <span className="text-slate-300">•</span>
                                ₦{lead.totalCost.toLocaleString()} Est. Value
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="text-right hidden md:block">
                                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Created</div>
                                <div className="text-sm text-slate-600">{lead.date}</div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                                <ChevronRight className="w-4 h-4"/>
                             </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>
  );

  // SUB-COMPONENT: BRANDING STUDIO
  const BrandingStudio = () => {
    const [localBranding, setLocalBranding] = useState(branding);
    
    const handleSave = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 800)),
            { loading: 'Updating branding...', success: 'Public calculator updated', error: 'Failed' }
        ).then(() => updateBranding(localBranding));
    };

    return (
      <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
         <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Branding Studio</h2>
                <p className="text-sm text-slate-500">Customize how your calculator looks to your customers.</p>
            </div>
            
            <Card className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Primary Color</label>
                       <div className="flex items-center gap-3">
                           <input type="color" value={localBranding.primaryColor} onChange={e => setLocalBranding({...localBranding, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-none"/>
                           <span className="text-sm font-mono text-slate-600 uppercase">{localBranding.primaryColor}</span>
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Accent Color</label>
                       <div className="flex items-center gap-3">
                           <input type="color" value={localBranding.accentColor} onChange={e => setLocalBranding({...localBranding, accentColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-none"/>
                           <span className="text-sm font-mono text-slate-600 uppercase">{localBranding.accentColor}</span>
                       </div>
                   </div>
                </div>
                
                <div>
                   <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Company Name</label>
                   <Input value={localBranding.companyName} onChange={e => setLocalBranding({...localBranding, companyName: e.target.value})} />
                </div>
                
                <div>
                   <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tagline (Optional)</label>
                   <Input value={localBranding.tagline} onChange={e => setLocalBranding({...localBranding, tagline: e.target.value})} />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Company Logo</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors" onClick={() => toast.success('Logo uploaded (mock)')}>
                        <Upload className="w-6 h-6 text-slate-400 mb-2"/>
                        <div className="text-sm text-slate-600">Click to upload logo</div>
                        <div className="text-xs text-slate-400">PNG or SVG, max 2MB</div>
                    </div>
                </div>

                <Button onClick={handleSave} className="w-full">Save Branding Settings</Button>
            </Card>
         </div>

         {/* LIVE PREVIEW */}
         <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-3 h-3"/> Live Mobile Preview
            </div>
            <div className="border-[8px] border-slate-800 rounded-[2.5rem] bg-slate-800 shadow-2xl overflow-hidden max-w-[320px] mx-auto h-[600px] relative">
               <div className="absolute top-0 w-full h-full bg-[#F8FAFC] overflow-hidden flex flex-col">
                  {/* Mock Navbar */}
                  <div className="h-16 border-b bg-white flex items-center px-4 justify-between shrink-0">
                      <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{background: localBranding.accentColor}}>
                              <Zap className="w-3 h-3 fill-current" style={{color: localBranding.primaryColor}}/>
                          </div>
                          <div className="text-xs font-bold" style={{color: '#0f172a'}}>{localBranding.companyName}</div>
                      </div>
                      <Menu className="w-4 h-4 text-slate-400"/>
                  </div>
                  {/* Mock Hero */}
                  <div className="p-6 flex flex-col justify-center items-center text-center flex-1">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{background: `${localBranding.accentColor}30`}}>
                          <CheckCircle className="w-8 h-8" style={{color: localBranding.primaryColor}}/>
                      </div>
                      <div className="text-xl font-bold mb-2 text-slate-900">Your Solar Quote</div>
                      <div className="text-xs text-slate-500 mb-6">{localBranding.tagline || 'Powered by Inverta'}</div>
                      <button className="w-full py-3 rounded-lg text-xs font-bold text-white shadow-lg" style={{background: localBranding.primaryColor}}>Reveal Price</button>
                  </div>
               </div>
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl"></div>
            </div>
         </div>
      </div>
    );
  };

  const handleShare = (method: 'copy' | 'whatsapp') => {
    if (method === 'copy') {
      navigator.clipboard.writeText(`https://inverta.app/calculator/${user?.id}`);
      toast.success('Link copied to clipboard');
    } else {
      toast.success('Opening WhatsApp...');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]" style={{'--primary': branding.primaryColor} as React.CSSProperties}>
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center gap-3 px-8 border-b border-slate-100">
            <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-900 fill-current" />
            </div>
            <span className="font-bold text-lg text-green-950">Inverta.</span>
        </div>
        <div className="flex-1 space-y-1 p-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</div>
            <button onClick={() => setActiveTab('overview')} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === 'overview' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-50')}><BarChart3 className="h-4 w-4"/> Overview</button>
            <button onClick={() => setActiveTab('leads')} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === 'leads' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-50')}><Users className="h-4 w-4"/> Leads Pipeline</button>
            <button onClick={() => setActiveTab('catalog')} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === 'catalog' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-50')}><Settings className="h-4 w-4"/> Catalog</button>
            <button onClick={() => setActiveTab('branding')} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === 'branding' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-50')}><Palette className="h-4 w-4"/> Branding</button>
        </div>
        <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 mb-3 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-sm font-bold text-white shadow-sm">
                    {user?.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <div className="truncate text-sm font-bold text-slate-900">{user?.companyName}</div>
                    <div className="truncate text-xs text-slate-500">{user?.email}</div>
                </div>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"><LogOut className="h-3 w-3"/> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-8 bg-white p-4 rounded-xl border shadow-sm">
             <div className="font-bold text-green-900 flex items-center gap-2"><div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center"><Zap className="w-3 h-3"/></div> Inverta</div>
             <Button size="sm" variant="ghost" onClick={logout}><LogOut className="w-4 h-4"/></Button>
        </div>

        {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Here's what's happening with your quotes today.</p>
                    </div>
                </div>
                
                {/* SHARE CARD */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold mb-1">Your Public Calculator</h3>
                        <p className="text-slate-300 text-sm mb-4">Share this link to capture leads automatically.</p>
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 pl-3 border border-white/10">
                            <span className="text-xs font-mono text-slate-300 truncate max-w-[200px]">inverta.app/calc/{user?.id}</span>
                            <button onClick={() => handleShare('copy')} className="px-3 py-1.5 bg-white text-slate-900 rounded text-xs font-bold hover:bg-slate-100">Copy</button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1ebc57] text-white rounded-lg font-bold text-sm transition-colors">
                             <MessageCircle className="w-4 h-4"/> Share via WhatsApp
                         </button>
                         <Button onClick={() => navigate('/calculator')} variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
                             Preview
                         </Button>
                    </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</div>
                        <div className="text-4xl font-extrabold text-slate-900">{leads.length}</div>
                        <div className="mt-2 text-xs text-green-600 font-medium">+2 this week</div>
                    </Card>
                    <Card className="p-6 bg-white border-slate-200 shadow-sm">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Value</div>
                        <div className="text-4xl font-extrabold text-slate-900">₦{leads.reduce((acc, curr) => acc + curr.totalCost, 0).toLocaleString()}</div>
                    </Card>
                    <Card className="p-6 bg-[var(--primary)] text-white border-transparent">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Conversion Rate</div>
                        <div className="text-4xl font-extrabold">0%</div>
                        <div className="mt-2 text-xs text-white/80 font-medium">Needs attention</div>
                    </Card>
                </div>
                <LeadsList />
            </div>
        )}
        {activeTab === 'leads' && <LeadsList />}
        {activeTab === 'catalog' && <CatalogEditor />}
        {activeTab === 'branding' && <BrandingStudio />}
      </main>
    </div>
  );
};

// 4. CALCULATOR PAGE (DYNAMIC BRANDING)
const CalculatorPage = () => {
  const { catalog, addLead, user, branding, navigate } = useContext(AppContext)!;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // -- STATES --
  const [financeData, setFinanceData] = useState({ bill: 50000, fuel: 30000 });
  const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>([]);
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [result, setResult] = useState<any>(null);

  // -- HANDLERS --
  const toggleAppliance = (app: Appliance) => {
    const exists = selectedAppliances.find(a => a.id === app.id);
    if (exists) {
      setSelectedAppliances(selectedAppliances.filter(a => a.id !== app.id));
    } else {
      setSelectedAppliances([...selectedAppliances, { ...app, count: 1, hours: app.defaultHours }]);
    }
  };

  const updateAppliance = (id: string, field: 'count' | 'hours', delta: number) => {
    setSelectedAppliances(curr => curr.map(item => {
      if (item.id !== id) return item;
      const newVal = item[field] + delta;
      if (newVal < 1) return item; // Don't go below 1
      return { ...item, [field]: newVal };
    }));
  };

  const handleCalculate = () => {
    if (!contactData.name || !contactData.email) {
        toast.error('Please enter your details');
        return;
    }
    
    // Simulate complex calculation time with toast
    toast.promise(
        new Promise(resolve => setTimeout(resolve, 2000)),
        { loading: 'Calculating best system...', success: 'Quote generated successfully', error: 'Error' }
    ).then(() => {
        const calc = calculateSolarSystem(financeData.bill, financeData.fuel, selectedAppliances, catalog);
        setResult(calc);
        
        addLead({
            id: Math.random().toString(36).substr(2, 9),
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            consumption: Math.round(calc.details.dailyWh / 1000),
            systemSize: `${(calc.system.inverter?.spec || 0)/1000}kVA`,
            totalCost: calc.financials.totalCost,
            status: 'New',
            date: new Date().toLocaleDateString()
        });
        setStep(4);
    });
  };

  // DYNAMIC STYLE CONTAINER
  const containerStyle = {
      '--primary': branding.primaryColor,
      '--accent': branding.accentColor,
  } as React.CSSProperties;

  // -- SUB-COMPONENTS --
  const CalcHeader = () => (
      <div className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3 font-bold text-slate-900">
             <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: branding.accentColor}}>
                 <Zap className="w-4 h-4 fill-current" style={{color: branding.primaryColor}} />
             </div>
             <div>
                <span className="block text-sm leading-tight">{branding.companyName}</span>
                <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wide">{branding.tagline}</span>
             </div>
          </div>
          {step > 1 && step < 4 && (
             <div className="flex gap-1">
                <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--primary)]' : 'bg-slate-200'}`}/>
                <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--primary)]' : 'bg-slate-200'}`}/>
                <div className={`h-1 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-[var(--primary)]' : 'bg-slate-200'}`}/>
             </div>
          )}
          {user && <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-xs">Exit</Button>}
      </div>
  );

  // STEP 1: FINANCIAL BASELINE
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" style={containerStyle}>
        <CalcHeader />
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-in zoom-in-95 duration-300">
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Let's start with your bills.</h1>
                        <p className="text-slate-500">We use this to calculate your Return on Investment (ROI).</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Monthly Electric Bill (₦)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-400">₦</span>
                                <Input 
                                    type="number" 
                                    value={financeData.bill} 
                                    onChange={e => setFinanceData({...financeData, bill: Number(e.target.value)})} 
                                    className="pl-8 text-lg font-medium h-14" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Monthly Fuel/Diesel Cost (₦)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-400">₦</span>
                                <Input 
                                    type="number" 
                                    value={financeData.fuel} 
                                    onChange={e => setFinanceData({...financeData, fuel: Number(e.target.value)})} 
                                    className="pl-8 text-lg font-medium h-14" 
                                />
                            </div>
                        </div>
                        <Button className="w-full h-14 text-lg mt-4 rounded-xl" onClick={() => setStep(2)}>
                            Next: Load Audit <ArrowRight className="w-5 h-5 ml-2"/>
                        </Button>
                    </div>
                </div>
                <div className="mt-6 flex justify-center gap-8 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Physics-based</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Market Pricing</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // STEP 2: APPLIANCE AUDIT
  if (step === 2) {
    const totalWatts = selectedAppliances.reduce((acc, curr) => acc + (curr.watts * curr.count), 0);
    
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" style={containerStyle}>
        <CalcHeader />
        <div className="flex-1 container mx-auto p-4 md:p-8 max-w-5xl">
            <div className="grid lg:grid-cols-12 gap-8 h-full">
                {/* Left: Selection */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">What do you want to power?</h1>
                        <p className="text-slate-500 mt-1">Select appliances to build your load profile.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {COMMON_APPLIANCES.map(app => {
                            const isSelected = selectedAppliances.find(a => a.id === app.id);
                            return (
                                <button 
                                    key={app.id}
                                    onClick={() => toggleAppliance(app)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 h-32 text-center",
                                        isSelected 
                                            ? "border-[var(--primary)] bg-slate-50 ring-1 ring-[var(--primary)] shadow-sm" 
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                                    )}
                                >
                                    <div className={cn("mb-3 p-2 rounded-full", isSelected ? "bg-[var(--accent)] text-slate-900" : "bg-slate-100 text-slate-500")}>
                                        {app.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{app.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-1">{app.watts}W</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Audit Summary */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900">Your Load Profile</h3>
                            <div className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{selectedAppliances.length} Items</div>
                        </div>

                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {selectedAppliances.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                    No items selected yet.
                                </div>
                            )}
                            {selectedAppliances.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                        <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                            <span>{item.watts}W</span>
                                            <span className="text-slate-300">•</span>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => updateAppliance(item.id, 'hours', -1)} className="hover:text-[var(--primary)] text-lg leading-none">-</button>
                                                <span className="font-medium text-slate-700">{item.hours}h/day</span>
                                                <button onClick={() => updateAppliance(item.id, 'hours', 1)} className="hover:text-[var(--primary)] text-lg leading-none">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateAppliance(item.id, 'count', -1)} className="w-6 h-6 rounded bg-white border flex items-center justify-center hover:border-[var(--primary)]">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{item.count}</span>
                                        <button onClick={() => updateAppliance(item.id, 'count', 1)} className="w-6 h-6 rounded bg-white border flex items-center justify-center hover:border-[var(--primary)]">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Est. Peak Load</span>
                                <span className="font-bold text-slate-900">{totalWatts.toLocaleString()}W</span>
                             </div>
                             {totalWatts > 0 && (
                                <Button className="w-full mt-4" onClick={() => setStep(3)}>
                                    Confirm Load & Continue
                                </Button>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // STEP 3: CONTACT INFO
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" style={containerStyle}>
        <CalcHeader />
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-in slide-in-from-right-8 duration-300">
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: `${branding.accentColor}40`}}>
                        <CheckCircle className="w-8 h-8" style={{color: branding.primaryColor}}/>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Analysis Complete.</h1>
                    <p className="text-slate-500 mb-8">Enter your details to generate your official PDF proposal.</p>
                    
                    <div className="space-y-4 text-left">
                        <Input placeholder="Full Name" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} className="h-12 bg-slate-50 border-slate-200"/>
                        <Input placeholder="Email Address" type="email" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} className="h-12 bg-slate-50 border-slate-200" />
                        <Input placeholder="Phone Number" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="h-12 bg-slate-50 border-slate-200"/>
                        
                        <Button className="w-full h-14 text-lg mt-2 font-bold" onClick={handleCalculate} disabled={loading}>
                            {loading ? 'Processing...' : 'Reveal My System Price'}
                        </Button>
                        <button onClick={() => setStep(2)} className="w-full text-center text-sm text-slate-400 hover:text-green-900 mt-2">← Back to Appliances</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // STEP 4: RESULTS (FINAL)
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20" style={containerStyle}>
      <CalcHeader />
      
      <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-700">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{background: `${branding.accentColor}30`, color: branding.primaryColor}}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{background: branding.primaryColor}}/>
                Recommended System
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Your Solar Proposal</h1>
            <p className="text-slate-500 mt-1">Designed for <b>{formatNaira(financeData.bill)}</b> monthly spend & <b>{selectedAppliances.length}</b> appliances.</p>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4"/> Download PDF Report</Button>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left: System Config */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Visual System Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="p-5 border-blue-200 bg-blue-50/50 relative overflow-hidden group hover:border-blue-300">
                        <div className="relative z-10">
                            <div className="text-blue-900 font-bold text-3xl mb-1">{result.system.panelCount}x</div>
                            <div className="text-blue-800 font-semibold text-sm">Solar Panels</div>
                            <div className="text-blue-600/80 text-xs mt-1">{result.system.panel.name}</div>
                        </div>
                        <Sun className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-100 group-hover:scale-110 transition-transform duration-500"/>
                    </Card>
                    <Card className="p-5 border-amber-200 bg-amber-50/50 relative overflow-hidden group hover:border-amber-300">
                        <div className="relative z-10">
                            <div className="text-amber-900 font-bold text-3xl mb-1">{result.system.inverterCount}x</div>
                            <div className="text-amber-800 font-semibold text-sm">Hybrid Inverter</div>
                            <div className="text-amber-600/80 text-xs mt-1">{result.system.inverter.name}</div>
                        </div>
                        <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-amber-100 group-hover:scale-110 transition-transform duration-500"/>
                    </Card>
                    <Card className="p-5 border-emerald-200 bg-emerald-50/50 relative overflow-hidden group hover:border-emerald-300">
                        <div className="relative z-10">
                            <div className="text-emerald-900 font-bold text-3xl mb-1">{result.system.batteryCount}x</div>
                            <div className="text-emerald-800 font-semibold text-sm">Lithium Battery</div>
                            <div className="text-emerald-600/80 text-xs mt-1">{result.system.battery.name}</div>
                        </div>
                        <Battery className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-100 group-hover:scale-110 transition-transform duration-500"/>
                    </Card>
                </div>

                {/* Investment Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Investment Breakdown</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <div className="text-slate-600 text-sm">Equipment Cost</div>
                            <div className="font-medium text-slate-900">{formatNaira(result.financials.totalCost - 150000)}</div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <div className="text-slate-600 text-sm">Installation & Logistics</div>
                            <div className="font-medium text-slate-900">{formatNaira(150000)}</div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="text-slate-900 font-bold">Total Turnkey Price</div>
                            <div className="font-extrabold text-2xl text-[var(--primary)]">{formatNaira(result.financials.totalCost)}</div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl flex items-start gap-3">
                        <div className="mt-1"><CheckCircle className="w-5 h-5 text-green-600"/></div>
                        <div>
                            <div className="font-bold text-slate-900 text-sm">What's included?</div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Complete installation, cabling, safety switches, earthing kit, remote monitoring setup, and 1-year workmanship warranty.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: ROI & Impact */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="bg-[#0f172a] text-white p-6 border-none shadow-xl">
                    <h3 className="text-lg font-bold mb-6">Financial Impact</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Annual Savings</div>
                            <div className="text-3xl font-bold text-lime-400">{formatNaira(result.financials.totalAnnualSavings)}</div>
                            <div className="text-slate-400 text-xs mt-1">vs. current Grid + Gen spend</div>
                        </div>

                        <div className="h-px bg-slate-800 w-full"/>

                        <div>
                            <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Payback Period</div>
                            <div className="text-3xl font-bold text-white">{result.financials.roiYears.toFixed(1)} <span className="text-lg font-normal text-slate-400">Years</span></div>
                            <div className="text-slate-400 text-xs mt-1">Tax-free return on capital</div>
                        </div>
                    </div>
                </Card>
                
                <Card className="p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Leaf className="w-5 h-5"/>
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">Environmental Score</div>
                            <div className="text-xs text-slate-500">Based on Nigerian Grid Factor</div>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600">
                        You will mitigate approximately <b className="text-green-700">{Math.round(result.impact.co2Saved)} tons</b> of CO₂ over 25 years.
                    </div>
                </Card>

                <div className="text-center pt-4">
                    <Button className="w-full h-14 text-lg shadow-lg mb-3">Accept Proposal</Button>
                    <p className="text-xs text-slate-400">Valid for 7 days. Terms apply.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- MAIN APP & ROUTING ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>(DEFAULT_CATALOG);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [route, setRoute] = useState<string>('/');

  // LocalStorage Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('inverta_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCatalog = localStorage.getItem('inverta_catalog');
    if (savedCatalog) setCatalog(JSON.parse(savedCatalog));
    const savedLeads = localStorage.getItem('inverta_leads');
    if (savedLeads) setLeads(JSON.parse(savedLeads));
    const savedBranding = localStorage.getItem('inverta_branding');
    if (savedBranding) setBranding(JSON.parse(savedBranding));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('inverta_user', JSON.stringify(user));
    else localStorage.removeItem('inverta_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('inverta_catalog', JSON.stringify(catalog)); }, [catalog]);
  useEffect(() => { localStorage.setItem('inverta_leads', JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem('inverta_branding', JSON.stringify(branding)); }, [branding]);

  // Actions
  const login = (email: string) => {
    setUser({ id: '1', name: 'Installer Admin', email, companyName: 'Suntap Energy Ltd.' });
  };
  const logout = () => {
    setUser(null);
    setRoute('/');
  };
  const updateCatalog = (items: CatalogItem[]) => setCatalog(items);
  const updateBranding = (b: Branding) => setBranding(b);
  const addLead = (lead: Lead) => setLeads(prev => [lead, ...prev]);
  const navigate = (path: string) => setRoute(path);

  // Router
  let CurrentComponent = LandingPage;
  if (route === '/login') CurrentComponent = AuthPage;
  else if (route === '/dashboard') {
    if (user) CurrentComponent = DashboardPage;
    else CurrentComponent = AuthPage;
  }
  else if (route === '/calculator') CurrentComponent = CalculatorPage;

  const contextValue = {
    user,
    isAuthenticated: !!user,
    catalog,
    branding,
    leads,
    route,
    navigate,
    login,
    logout,
    updateCatalog,
    updateBranding,
    addLead
  };

  return (
    <AppContext.Provider value={contextValue}>
       <Toaster />
       <CurrentComponent />
    </AppContext.Provider>
  );
}