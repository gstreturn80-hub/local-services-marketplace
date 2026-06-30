"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  BarChart, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  DollarSign, 
  Loader2, 
  Grid, 
  MapPin, 
  FileText, 
  Sliders,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Download,
  Database,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

export default function AdminDashboard() {
  const { user, authenticated, loading } = useApp();
  const router = useRouter();

  // Tab navigation state
  const [activeTab, setActiveTab] = useState("stats"); // stats | categories | areas | verify | banners | reports

  // API datasets
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states - Service Category
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("Zap");
  const [catType, setCatType] = useState("HOME");
  const [addingCategory, setAddingCategory] = useState(false);

  // Form states - Area
  const [areaState, setAreaState] = useState("Karnataka");
  const [areaCity, setAreaCity] = useState("Bengaluru");
  const [areaName, setAreaName] = useState("");
  const [areaPincode, setAreaPincode] = useState("");
  const [addingArea, setAddingArea] = useState(false);

  // Verification overlay state
  const [verifyTarget, setVerifyTarget] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Seed loading state
  const [seeding, setSeeding] = useState(false);

  // Route protection
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/admin");
    }
  }, [loading, authenticated]);

  // Load datasets when tab changes
  useEffect(() => {
    if (authenticated && user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [authenticated, user, activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      if (activeTab === "stats" || activeTab === "reports") {
        const statsRes = await fetch("/api/admin/reports");
        if (statsRes.ok) setStats(await statsRes.json());
      }
      
      if (activeTab === "categories") {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) setCategories(await catRes.json());
      }

      if (activeTab === "areas") {
        const areasRes = await fetch("/api/areas");
        if (areasRes.ok) setAreas(await areasRes.json());
      }

      if (activeTab === "verify") {
        const verifyRes = await fetch("/api/admin/verify?status=PENDING");
        if (verifyRes.ok) setPendingProviders(await verifyRes.json());
      }
    } catch (e) {
      console.error("Admin dashboard data fetch failed:", e);
    } finally {
      setLoadingData(false);
    }
  };

  // Add category (POST)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catIcon) return;

    try {
      setAddingCategory(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          description: catDesc,
          icon: catIcon,
          type: catType
        })
      });

      if (res.ok) {
        setCatName("");
        setCatDesc("");
        setCatIcon("Zap");
        await fetchAdminData();
        alert("Service Category created successfully.");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchAdminData();
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run KYC verification approval / rejection
  const handleVerifyAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !rejectionReason.trim()) {
      alert("Please specify a reason for rejecting documentation.");
      return;
    }

    try {
      setVerifying(true);
      const res = await fetch("/api/admin/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerProfileId: verifyTarget.id,
          action,
          rejectionReason: action === "REJECT" ? rejectionReason : undefined
        })
      });

      if (res.ok) {
        setVerifyTarget(null);
        setRejectionReason("");
        await fetchAdminData();
        alert(`Verification action "${action}" complete.`);
      } else {
        alert("Failed to record verification status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // Run DB Seed utility
  const handleResetDatabase = async () => {
    if (!confirm("⚠️ WARNING: This will completely wipe all tables and seed default mock configurations. Proceed?")) return;
    try {
      setSeeding(true);
      const res = await fetch("/api/seed");
      if (res.ok) {
        alert("Database re-seeded successfully!");
        await fetchAdminData();
      } else {
        alert("Database seeding failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const linkClass = (tab: string) => `
    flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-xl border transition-all text-left cursor-pointer
    ${activeTab === tab 
      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10" 
      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground"}
  `;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md border border-indigo-500/20">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-3xs uppercase bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-primary-foreground">Platform Administration</span>
              <h1 className="text-2xl font-black">Super Admin Panel</h1>
              <p className="text-xs text-white/80 leading-snug max-w-lg">Manage dynamic service categories, verify government documentation, configure banners, and export analytics files.</p>
            </div>
            
            <button
              onClick={handleResetDatabase}
              disabled={seeding}
              className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              <span>Reset Database</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
              <button onClick={() => setActiveTab("stats")} className={linkClass("stats")}>
                <TrendingUp className="h-4 w-4 shrink-0" /> Overview Stats
              </button>
              <button onClick={() => setActiveTab("categories")} className={linkClass("categories")}>
                <Grid className="h-4 w-4 shrink-0" /> Manage Services
              </button>
              <button onClick={() => setActiveTab("areas")} className={linkClass("areas")}>
                <MapPin className="h-4 w-4 shrink-0" /> Manage Areas
              </button>
              <button onClick={() => setActiveTab("verify")} className={linkClass("verify")}>
                <ShieldAlert className="h-4 w-4 shrink-0" /> KYC Verifications
              </button>
              <button onClick={() => setActiveTab("reports")} className={linkClass("reports")}>
                <FileText className="h-4 w-4 shrink-0" /> Export CSV Reports
              </button>
            </div>

            {/* Main Tabs Workspace */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* TAB 1: OVERVIEW STATISTICS */}
              {activeTab === "stats" && stats && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Cards Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
                      <Users className="h-6 w-6 text-primary mb-2" />
                      <p className="text-4xs text-muted-foreground uppercase font-black">Customers</p>
                      <p className="text-xl font-black text-foreground mt-0.5">{stats.totalCustomers}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
                      <Briefcase className="h-6 w-6 text-primary mb-2" />
                      <p className="text-4xs text-muted-foreground uppercase font-black">Providers</p>
                      <p className="text-xl font-black text-foreground mt-0.5">{stats.totalProviders}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
                      <ShieldAlert className="h-6 w-6 text-emerald-500 mb-2" />
                      <p className="text-4xs text-muted-foreground uppercase font-black">Verified Pros</p>
                      <p className="text-xl font-black text-emerald-500 mt-0.5">{stats.verifiedProviders}</p>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
                      <p className="text-4xs text-muted-foreground uppercase font-black">Pending KYC</p>
                      <p className="text-xl font-black text-amber-500 mt-0.5">{stats.pendingVerification}</p>
                    </div>
                  </div>

                  {/* Revenue Splits */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-foreground">Revenue Summary</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="border border-border p-4 rounded-xl bg-background text-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-4xs text-muted-foreground uppercase font-black">Booking Fee Pool</p>
                        <p className="text-xl font-black text-primary mt-0.5">₹{stats.bookingFeeIncome}</p>
                      </div>
                      <div className="border border-border p-4 rounded-xl bg-background text-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-4xs text-muted-foreground uppercase font-black">Platform Commissions (15%)</p>
                        <p className="text-xl font-black text-primary mt-0.5">₹{stats.commissionIncome}</p>
                      </div>
                      <div className="border border-border p-4 rounded-xl bg-background text-center">
                        <DollarSign className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-4xs text-muted-foreground uppercase font-black">Total Revenue</p>
                        <p className="text-xl font-black text-primary mt-0.5">₹{stats.totalRevenue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Chart Simulation (CSS Columns) */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-base text-foreground">Monthly Earnings Visualization</h3>
                    
                    <div className="h-48 flex items-end justify-between gap-4 border-b border-border pb-1 text-center font-bold text-3xs text-muted-foreground">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: "40px" }} />
                        <span>April</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: "60px" }} />
                        <span>May</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-10 bg-primary rounded-t-lg shadow" style={{ height: "120px" }} />
                        <span className="text-primary font-black">June (Current)</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MANAGE SERVICES */}
              {activeTab === "categories" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
                    <h3 className="font-bold text-base text-foreground">Create Service Category</h3>
                    
                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold items-end">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="E.g. Mason" 
                          value={catName} 
                          onChange={(e) => setCatName(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Icon (Lucide Class)</label>
                        <select 
                          value={catIcon}
                          onChange={(e) => setCatIcon(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="Zap">Zap (Electricity)</option>
                          <option value="Droplet">Droplet (Plumbing)</option>
                          <option value="Hammer">Hammer (Carpentry)</option>
                          <option value="Paintbrush">Paintbrush (Painting)</option>
                          <option value="Grid">Grid (Mason)</option>
                          <option value="Flame">Flame (Welder)</option>
                          <option value="Wind">Wind (AC)</option>
                          <option value="Shield">Shield (CCTV)</option>
                          <option value="RefreshCw">RefreshCw (RO)</option>
                          <option value="Sparkles">Sparkles (Cleaning)</option>
                          <option value="PenTool">PenTool (Portrait)</option>
                          <option value="Palette">Palette (Art)</option>
                          <option value="Printer">Printer (Flex)</option>
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Category Type</label>
                        <select 
                          value={catType}
                          onChange={(e) => setCatType(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="HOME">Home Services</option>
                          <option value="CREATIVE">Creative Services</option>
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <button
                          type="submit"
                          disabled={addingCategory}
                          className="w-full rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground py-2 font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {addingCategory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          <span>Add Category</span>
                        </button>
                      </div>
                      <div className="space-y-1 col-span-1 sm:col-span-4">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Description</label>
                        <input 
                          type="text" 
                          placeholder="Brief explanation of services covered..." 
                          value={catDesc} 
                          onChange={(e) => setCatDesc(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 focus:outline-none"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Categories list */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-secondary/50 text-muted-foreground text-4xs uppercase font-bold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Icon</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat: any) => (
                          <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-secondary/15 transition-colors">
                            <td className="px-4 py-3 font-semibold text-primary">{cat.icon}</td>
                            <td className="px-4 py-3 font-bold text-foreground">{cat.name}</td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{cat.description || "N/A"}</td>
                            <td className="px-4 py-3">
                              <span className="text-4xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                                {cat.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-destructive hover:text-destructive/80 font-bold"
                              >
                                <Trash2 className="h-4 w-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: MANAGE SERVICE AREAS */}
              {activeTab === "areas" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-2">
                    <h3 className="font-bold text-base text-foreground">Service Area Pincodes Covered</h3>
                    <p className="text-3xs text-muted-foreground leading-relaxed">
                      Below are all unique area pincodes where providers are actively mapping coverage. Providers only show up on search if their registered covers overlap.
                    </p>
                  </div>

                  {/* Areas lists */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-secondary/50 text-muted-foreground text-4xs uppercase font-bold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">State</th>
                          <th className="px-4 py-3">City</th>
                          <th className="px-4 py-3">Area Name</th>
                          <th className="px-4 py-3 font-black">Pincode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {areas.length > 0 ? (
                          areas.map((sa: any) => (
                            <tr key={sa.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3 font-semibold text-muted-foreground">{sa.state}</td>
                              <td className="px-4 py-3">{sa.city}</td>
                              <td className="px-4 py-3 font-semibold">{sa.area}</td>
                              <td className="px-4 py-3 font-black text-primary">{sa.pincode}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                              No service areas indexed in database yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PROVIDER VERIFICATION KYC AUDITS */}
              {activeTab === "verify" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-1">
                    <h3 className="font-bold text-base text-foreground">KYC Verification Portal</h3>
                    <p className="text-3xs text-muted-foreground">Perform audits on Aadhaar card uploads and portraits. Grant verified partner badges.</p>
                  </div>

                  {pendingProviders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingProviders.map((pro: any) => (
                        <div key={pro.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center gap-3">
                            <img src={pro.user.avatarUrl} alt={pro.user.name} className="h-10 w-10 rounded-full object-cover" />
                            <div>
                              <h4 className="font-bold text-xs text-foreground">{pro.user.name}</h4>
                              <p className="text-4xs text-muted-foreground">Skills: {pro.skills}</p>
                              <p className="text-4xs text-muted-foreground">Experience: {pro.experience} years</p>
                            </div>
                          </div>

                          <div className="border-t border-border pt-3">
                            <button
                              onClick={() => setVerifyTarget(pro)}
                              className="w-full text-center rounded-lg bg-secondary text-primary hover:bg-primary/10 py-1.5 text-3xs font-bold transition-all cursor-pointer"
                            >
                              Review Audits Credentials
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground border border-dashed border-border p-6 rounded-2xl text-center">No providers currently pending verification approval.</p>
                  )}
                </div>
              )}

              {/* TAB 6: REPORTS & EXPORTS */}
              {activeTab === "reports" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-1">
                    <h3 className="font-bold text-base text-foreground">Download Analytics Reports</h3>
                    <p className="text-3xs text-muted-foreground">Export platform data log sheets directly to Excel/CSV format.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <a
                      href="/api/admin/reports?export=true&type=summary"
                      target="_blank"
                      className="bg-card border border-border rounded-2xl p-5 text-center space-y-3 hover:border-primary shadow-2xs hover:shadow transition-all block cursor-pointer"
                    >
                      <FileText className="h-7 w-7 text-primary mx-auto" />
                      <div>
                        <h4 className="font-bold text-xs text-foreground">Marketplace Summary</h4>
                        <p className="text-4xs text-muted-foreground mt-0.5">Platform revenue, counts, splits</p>
                      </div>
                      <span className="rounded-lg bg-secondary px-3 py-1 text-4xs font-bold inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </span>
                    </a>

                    <a
                      href="/api/admin/reports?export=true&type=bookings"
                      target="_blank"
                      className="bg-card border border-border rounded-2xl p-5 text-center space-y-3 hover:border-primary shadow-2xs hover:shadow transition-all block cursor-pointer"
                    >
                      <FileText className="h-7 w-7 text-primary mx-auto" />
                      <div>
                        <h4 className="font-bold text-xs text-foreground">Bookings Ledger</h4>
                        <p className="text-4xs text-muted-foreground mt-0.5">Details, customers, fees, status</p>
                      </div>
                      <span className="rounded-lg bg-secondary px-3 py-1 text-4xs font-bold inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </span>
                    </a>

                    <a
                      href="/api/admin/reports?export=true&type=providers"
                      target="_blank"
                      className="bg-card border border-border rounded-2xl p-5 text-center space-y-3 hover:border-primary shadow-2xs hover:shadow transition-all block cursor-pointer"
                    >
                      <FileText className="h-7 w-7 text-primary mx-auto" />
                      <div>
                        <h4 className="font-bold text-xs text-foreground">Providers Scope</h4>
                        <p className="text-4xs text-muted-foreground mt-0.5">Contacts, experiences, details</p>
                      </div>
                      <span className="rounded-lg bg-secondary px-3 py-1 text-4xs font-bold inline-flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </span>
                    </a>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* VERIFICATION OVERLAY POPUP MODAL */}
          {verifyTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
                
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <div>
                    <h3 className="font-black text-base text-foreground">KYC Auditing Credentials</h3>
                    <p className="text-4xs text-muted-foreground">Review registration documents submitted by {verifyTarget.user.name}</p>
                  </div>
                  <button onClick={() => setVerifyTarget(null)} className="text-muted-foreground hover:text-foreground">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhaar ID card */}
                  <div className="space-y-2 border border-border bg-background p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-foreground">Submitted Government ID (Aadhaar Card)</p>
                    <img 
                      src={verifyTarget.aadhaarUrl} 
                      alt="Aadhaar ID" 
                      className="h-32 w-auto object-contain mx-auto rounded border border-border bg-white" 
                    />
                  </div>

                  {/* Selfie Portrait */}
                  <div className="space-y-2 border border-border bg-background p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-foreground">Selfie Profile Portrait</p>
                    <img 
                      src={verifyTarget.selfieUrl} 
                      alt="Selfie" 
                      className="h-32 w-32 object-cover mx-auto rounded-full border-2 border-primary/20 bg-white" 
                    />
                  </div>
                </div>

                {/* Financial details review */}
                <div className="border border-border bg-background p-4 rounded-2xl space-y-2 text-xs">
                  <p className="font-bold text-xs text-foreground">Billing Details</p>
                  <p className="text-muted-foreground">UPI ID: <span className="text-foreground font-semibold font-mono">{verifyTarget.upiId || "N/A"}</span></p>
                  <p className="text-muted-foreground">Bank Account: <span className="text-foreground font-semibold font-mono">{verifyTarget.bankAccount || "N/A"}</span></p>
                </div>

                {/* Rejection input box */}
                <div className="space-y-1">
                  <label className="block text-3xs font-semibold uppercase text-muted-foreground">Rejection Reason (Required only if rejecting)</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Government ID photograph blurred or illegible..." 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Stepper actions */}
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button
                    disabled={verifying}
                    onClick={() => handleVerifyAction("REJECT")}
                    className="rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 px-4 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Reject Audit Credentials
                  </button>
                  <button
                    disabled={verifying}
                    onClick={() => handleVerifyAction("APPROVE")}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" /> : null}
                    Approve & Issue Badge
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
