"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Wallet, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  Briefcase,
  Upload,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function ProviderDashboard() {
  const { user, authenticated, loading, refreshUser } = useApp();
  const router = useRouter();

  // API Lists & data states
  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loadingData, setLoadingData] = useState(true);

  // Form states - Availability
  const [status, setStatus] = useState("");
  const [workingHoursStart, setWorkingHoursStart] = useState("");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Form states - Service Area
  const [newArea, setNewArea] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [addingArea, setAddingArea] = useState(false);

  // Form states - Wallet Withdrawal
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  // Form states - Portfolio
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioImage, setPortfolioImage] = useState("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400");
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  // Action loaders
  const [actionBookingId, setActionBookingId] = useState("");

  // Protecting Route
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/provider");
    }
  }, [loading, authenticated]);

  // Synchronize component states with user profile
  useEffect(() => {
    if (authenticated && user?.role === "PROVIDER" && user.providerProfile) {
      const p = user.providerProfile;
      setStatus(p.status);
      setWorkingHoursStart(p.workingHoursStart);
      setWorkingHoursEnd(p.workingHoursEnd);
      setWorkingDays(p.workingDays);
      setEmergencyAvailable(p.emergencyAvailable);
      
      fetchProviderDashboardData();
    }
  }, [authenticated, user]);

  const fetchProviderDashboardData = async () => {
    try {
      setLoadingData(true);
      // Fetch assigned bookings
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }

      // Fetch wallet balance
      const walletRes = await fetch("/api/wallet");
      if (walletRes.ok) {
        setWallet(await walletRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  // Submit Availability Changes
  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingAvailability(true);
      const res = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          workingHoursStart,
          workingHoursEnd,
          workingDays,
          emergencyAvailable
        })
      });
      if (res.ok) {
        await refreshUser();
        alert("Availability settings saved successfully.");
      } else {
        alert("Failed to save availability settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Add Service Area Pincode
  const handleAddServiceArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea.trim() || !newPincode.trim()) return;

    try {
      setAddingArea(true);
      // Grab current service areas list and append new one
      const currentAreas = user?.providerProfile.serviceAreas || [];
      const updatedAreas = [...currentAreas, {
        state: "Karnataka",
        district: "Bengaluru Urban",
        city: "Bengaluru",
        area: newArea.trim(),
        pincode: newPincode.trim()
      }];

      const res = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceAreas: updatedAreas })
      });

      if (res.ok) {
        setNewArea("");
        setNewPincode("");
        await refreshUser();
      } else {
        alert("Failed to add service area.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingArea(false);
    }
  };

  // Delete Service Area Pincode
  const handleDeleteServiceArea = async (areaId: string) => {
    try {
      const currentAreas = user?.providerProfile.serviceAreas || [];
      const updatedAreas = currentAreas.filter((sa: any) => sa.id !== areaId);

      const res = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceAreas: updatedAreas })
      });

      if (res.ok) {
        await refreshUser();
      } else {
        alert("Failed to delete service area.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Portfolio Photo
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioTitle.trim()) return;

    try {
      setAddingPortfolio(true);
      const res = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPortfolioItem: {
            imageUrl: portfolioImage,
            title: portfolioTitle,
            type: "WORK"
          }
        })
      });

      if (res.ok) {
        setPortfolioTitle("");
        await refreshUser();
      } else {
        alert("Failed to upload portfolio item.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingPortfolio(false);
    }
  };

  // Delete Portfolio Photo
  const handleDeletePortfolio = async (itemId: string) => {
    try {
      const res = await fetch("/api/providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletePortfolioItemId: itemId })
      });
      if (res.ok) {
        await refreshUser();
      } else {
        alert("Failed to delete portfolio item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Wallet withdrawal
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    try {
      setWithdrawing(true);
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount })
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setWithdrawAmount("");
        await fetchProviderDashboardData();
        alert(`Payout of ₹${withdrawAmount} requested successfully.`);
      } else {
        alert(d.error || "Withdrawal failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawing(false);
    }
  };

  // Transition Job status
  const handleBookingAction = async (bookingId: string, nextStatus: string) => {
    try {
      setActionBookingId(bookingId);
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: nextStatus,
          // Simulated mock completion images upon completed action
          completionImages: nextStatus === "COMPLETED" ? "https://images.unsplash.com/photo-1558402529-d2638a7023ef?q=80&w=400" : ""
        })
      });

      if (res.ok) {
        await fetchProviderDashboardData();
        await refreshUser();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update booking status");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionBookingId("");
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const p = user?.providerProfile;
  const isApproved = p?.verificationStatus === "APPROVED";
  const isPendingDoc = p?.verificationStatus === "PENDING";
  const isRejectedDoc = p?.verificationStatus === "REJECTED";

  // Categorize jobs
  const pendingJobs = bookings.filter(b => b.status === "PENDING");
  
  const todayJobs = bookings.filter(b => 
    b.status === "ACCEPTED" || b.status === "ON_THE_WAY" || b.status === "STARTED"
  );

  const completedJobsList = bookings.filter(b => 
    b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-md border border-slate-700">
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
                <span className="text-3xs uppercase bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-primary-foreground">Partner Portal</span>
                
                {/* Verification badges */}
                {isApproved && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-3xs font-semibold">
                    <CheckCircle className="h-3 w-3 fill-emerald-400 text-slate-900" />
                    KYC Verified Partner
                  </span>
                )}
                {isPendingDoc && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-3xs font-semibold">
                    <AlertTriangle className="h-3 w-3 fill-amber-400 text-slate-900" />
                    KYC Verification Pending
                  </span>
                )}
                {isRejectedDoc && (
                  <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/20 rounded-full px-2.5 py-0.5 text-3xs font-semibold">
                    <XCircle className="h-3 w-3 fill-red-400 text-slate-900" />
                    KYC Audits Rejected
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <p className="text-xs text-slate-300 leading-snug max-w-lg">
                {isApproved 
                  ? "Your account is live! Select availability toggles below to receive area pincode jobs." 
                  : `Please wait for admin audit checks. Rejection Reason: ${p?.rejectionReason || "None"}`}
              </p>
            </div>

            {/* Quick stats indicator */}
            <div className="flex gap-4">
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400 mx-auto mb-1.5" />
                <p className="text-4xs text-slate-300 uppercase font-bold tracking-wider">Rating</p>
                <p className="text-lg font-black mt-0.5">{p?.rating || "0.0"}★</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                <Briefcase className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <p className="text-4xs text-slate-300 uppercase font-bold tracking-wider">Jobs Done</p>
                <p className="text-lg font-black mt-0.5">{p?.completedJobs || 0}</p>
              </div>
            </div>
          </div>

          {/* Verification Warning for unverified partners */}
          {!isApproved && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs text-amber-500">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Verification Pending Approval</p>
                <p className="opacity-90 mt-0.5">
                  Your profile is currently waiting for admin KYC audit checks. You can configure your availability, bank details, and service area coverage below, but you will not appear in customer searches until your Aadhaar and selfie documents are approved.
                </p>
              </div>
            </div>
          )}

          {/* Split Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left panels (Schedule bookings and wallets) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Active incoming invites (PENDING) */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground">New Service Requests ({pendingJobs.length})</h2>
                {pendingJobs.length > 0 ? (
                  <div className="space-y-4">
                    {pendingJobs.map((b) => (
                      <div key={b.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start border-b border-border pb-3">
                          <div>
                            <span className="text-4xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{b.serviceName}</span>
                            <h3 className="font-bold text-xs mt-1">Request by {b.customer.name}</h3>
                          </div>
                          <span className="text-3xs uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">Pending Invite</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-3xs text-muted-foreground font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{b.date}</p>
                          <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{b.time}</p>
                          <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" />{b.address}</p>
                        </div>

                        {b.notes && (
                          <p className="text-3xs text-muted-foreground italic bg-secondary/30 p-2.5 rounded-lg">"{b.notes}"</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                          <span className="text-3xs font-semibold text-muted-foreground">Earnings: <b>₹{b.remainingAmount}</b></span>
                          <div className="flex gap-2">
                            <button
                              disabled={actionBookingId !== "" || !isApproved}
                              onClick={() => handleBookingAction(b.id, "CANCELLED")}
                              className="rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/5 px-3 py-1.5 text-3xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actionBookingId !== "" || !isApproved}
                              onClick={() => handleBookingAction(b.id, "ACCEPTED")}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-3xs font-bold transition-all cursor-pointer shadow disabled:opacity-50"
                            >
                              Accept Job
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground border border-dashed border-border p-6 rounded-2xl text-center">No new incoming service requests available.</p>
                )}
              </div>

              {/* Today's Schedule jobs */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground">Today's Dispatch Schedule ({todayJobs.length})</h2>
                {todayJobs.length > 0 ? (
                  <div className="space-y-4">
                    {todayJobs.map((b) => (
                      <div key={b.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start border-b border-border pb-3">
                          <div>
                            <span className="text-4xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{b.serviceName}</span>
                            <h3 className="font-bold text-xs mt-1">{b.customer.name} - #{b.id.slice(0, 8)}</h3>
                          </div>
                          <span className="text-3xs uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                            {b.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-3xs text-muted-foreground font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{b.date}</p>
                          <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{b.time}</p>
                          <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" />{b.address}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <div className="text-3xs text-muted-foreground">
                            <p>Remaining Settlement (Direct to you)</p>
                            <span className="font-bold text-foreground text-xs">₹{b.remainingAmount} ({b.remainingPaymentStatus === "PAID" ? "Settled" : "Pending"})</span>
                          </div>
                          
                          {/* Stepper dispatch actions */}
                          {b.status === "ACCEPTED" && (
                            <button
                              disabled={actionBookingId !== ""}
                              onClick={() => handleBookingAction(b.id, "ON_THE_WAY")}
                              className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-3xs font-bold transition-all cursor-pointer"
                            >
                              Depart to Location
                            </button>
                          )}
                          {b.status === "ON_THE_WAY" && (
                            <button
                              disabled={actionBookingId !== ""}
                              onClick={() => handleBookingAction(b.id, "STARTED")}
                              className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-3xs font-bold transition-all cursor-pointer"
                            >
                              Start Job Work
                            </button>
                          )}
                          {b.status === "STARTED" && (
                            <button
                              disabled={actionBookingId !== ""}
                              onClick={() => handleBookingAction(b.id, "COMPLETED")}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-3xs font-bold transition-all cursor-pointer"
                            >
                              Mark Job Completed
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground border border-dashed border-border p-6 rounded-2xl text-center">No active schedule jobs for today.</p>
                )}
              </div>

              {/* Wallet Withdrawal Panel */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-bold text-base text-foreground flex items-center justify-center sm:justify-start gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      Earnings Wallet
                    </h3>
                    <p className="text-3xs text-muted-foreground">Total platform earnings settled. Minimum withdrawal is ₹100.</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-4xs text-muted-foreground uppercase font-black">Settled Balance</p>
                    <p className="text-3xl font-black text-primary">₹{wallet.balance}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Withdrawal form */}
                  <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                    <h4 className="font-bold text-xs text-foreground">Request Payout</h4>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Withdrawal Amount (₹)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="E.g. 500" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[200px]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={withdrawing || wallet.balance < 100}
                      className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      <span>Withdraw to Bank</span>
                    </button>
                  </form>

                  {/* Transaction history logs */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-foreground border-b border-border pb-1">Payout & Settlement History</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {wallet.transactions && wallet.transactions.length > 0 ? (
                        wallet.transactions.map((tx: any) => (
                          <div key={tx.id} className="flex justify-between items-center text-3xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-foreground truncate max-w-[180px]">{tx.description}</p>
                              <span className="text-4xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`font-bold ${tx.amount > 0 ? "text-emerald-500" : "text-destructive"}`}>
                              {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-4xs text-muted-foreground">No ledger transactions recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* History Jobs */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground">Completed Jobs History</h2>
                {completedJobsList.length > 0 ? (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-secondary/50 text-muted-foreground text-4xs uppercase font-bold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Booking ID</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedJobsList.map((b) => (
                          <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-semibold text-muted-foreground">#{b.id.slice(0, 8)}</td>
                            <td className="px-4 py-3 font-bold text-foreground">{b.customer.name}</td>
                            <td className="px-4 py-3">{b.date}</td>
                            <td className="px-4 py-3 font-bold text-foreground">₹{b.remainingAmount}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-4xs font-bold uppercase ${
                                b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => router.push(`/customer/booking/${b.id}`)}
                                className="text-primary hover:text-primary/80 font-bold inline-flex items-center gap-0.5 text-3xs"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No completed service history recorded.</p>
                )}
              </div>

            </div>

            {/* Right panels (Availability, Service Areas, Portfolio managers) */}
            <div className="space-y-8">
              
              {/* Availability Manager */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  Availability Manager
                </h3>

                <form onSubmit={handleUpdateAvailability} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="block text-4xs font-bold uppercase text-muted-foreground">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="AVAILABLE">AVAILABLE (Online)</option>
                      <option value="BUSY">BUSY (Active on work)</option>
                      <option value="OFFLINE">OFFLINE (Away/Holiday)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-4xs font-bold uppercase text-muted-foreground">Start Hours</label>
                      <input 
                        type="time" 
                        value={workingHoursStart}
                        onChange={(e) => setWorkingHoursStart(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-4xs font-bold uppercase text-muted-foreground">End Hours</label>
                      <input 
                        type="time" 
                        value={workingHoursEnd}
                        onChange={(e) => setWorkingHoursEnd(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-4xs font-bold uppercase text-muted-foreground">Weekly Working Days</label>
                    <input 
                      type="text" 
                      placeholder="Mon,Tue,Wed,Thu,Fri"
                      value={workingDays}
                      onChange={(e) => setWorkingDays(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={emergencyAvailable}
                      onChange={(e) => setEmergencyAvailable(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <span>Available for Emergency dispatch</span>
                  </label>

                  <button
                    type="submit"
                    disabled={updatingAvailability}
                    className="w-full rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground py-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {updatingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>Save Timing Settings</span>
                  </button>
                </form>
              </div>

              {/* Service Areas scope Manager */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Service Areas Covered
                </h3>

                <div className="space-y-3">
                  {/* Pincode Covered lists */}
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {p?.serviceAreas && p.serviceAreas.length > 0 ? (
                      p.serviceAreas.map((sa: any) => (
                        <div key={sa.id} className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-bold text-foreground leading-tight">{sa.area}</p>
                            <span className="text-4xs text-muted-foreground">{sa.city} ({sa.pincode})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteServiceArea(sa.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-3xs text-amber-500 font-semibold">No active pincodes covers. Customers can't find you!</p>
                    )}
                  </div>

                  {/* Add pincode scope form */}
                  <form onSubmit={handleAddServiceArea} className="border-t border-border pt-4 space-y-3 text-xs font-semibold">
                    <p className="font-bold text-xs text-foreground">Add Coverage Pincode</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Area Name</label>
                        <input 
                          type="text" 
                          placeholder="E.g. Indiranagar" 
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold uppercase text-muted-foreground">Pincode</label>
                        <input 
                          type="text" 
                          placeholder="6-digit PIN" 
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={addingArea || !newArea || !newPincode}
                      className="rounded-lg bg-secondary text-primary hover:bg-primary/10 px-3 py-1.5 text-3xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {addingArea ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>Add Area</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Portfolio Images Manager */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Portfolio Manager
                </h3>

                <div className="space-y-4">
                  {/* Grid items */}
                  <div className="grid grid-cols-3 gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                    {p?.portfolioItems && p.portfolioItems.length > 0 ? (
                      p.portfolioItems.map((item: any) => (
                        <div key={item.id} className="relative aspect-square rounded bg-background border border-border overflow-hidden group">
                          <img src={item.imageUrl} alt="Work" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-3xs text-muted-foreground col-span-3 text-center py-4">No portfolio images uploaded.</p>
                    )}
                  </div>

                  {/* Add portfolio mockup photo form */}
                  <form onSubmit={handleAddPortfolio} className="border-t border-border pt-4 space-y-3 text-xs font-semibold">
                    <p className="font-bold text-xs text-foreground">Upload Work Photo</p>
                    <div className="space-y-1.5">
                      <label className="block text-4xs font-bold uppercase text-muted-foreground">Photo Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="E.g. Living room TV wiring" 
                        value={portfolioTitle}
                        onChange={(e) => setPortfolioTitle(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={addingPortfolio || !portfolioTitle}
                      className="rounded-lg bg-secondary text-primary hover:bg-primary/10 px-3 py-1.5 text-3xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {addingPortfolio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      <span>Upload Mock Photo</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
