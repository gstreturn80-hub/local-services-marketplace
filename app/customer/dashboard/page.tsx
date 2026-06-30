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
  ChevronRight, 
  Wallet, 
  Bell, 
  Heart,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";

export default function CustomerDashboard() {
  const { user, authenticated, loading } = useApp();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loadingData, setLoadingData] = useState(true);

  // Notifications (Mocked)
  const notifications = [
    { id: 1, text: "Your booking for AC Repair has been accepted by Ramesh Kumar.", date: "Today, 10:15 AM" },
    { id: 2, text: "Refund of ₹49 for cancelled booking #B1044 successfully completed.", date: "Yesterday, 3:30 PM" }
  ];

  // Saved Pros (Mocked)
  const savedPros = [
    { id: "p1", name: "Ramesh Kumar", skill: "Electrician", rating: 4.8, avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=150" },
    { id: "p2", name: "Amit Sharma", skill: "Painter / Colour Contractor", rating: 4.6, avatar: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=150" }
  ];

  // Route protection
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/customer");
    }
  }, [loading, authenticated]);

  useEffect(() => {
    if (authenticated && user?.role === "CUSTOMER") {
      fetchDashboardData();
    }
  }, [authenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      // Fetch customer's bookings
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.ok ? await bookingsRes.json() : []);
      }

      // Fetch wallet balance
      const walletRes = await fetch("/api/wallet");
      if (walletRes.ok) {
        setWallet(await walletRes.json());
      }
    } catch (e) {
      console.error("Error loading customer dashboard:", e);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const activeBookings = bookings.filter((b: any) => 
    b.status === "PENDING" || b.status === "ACCEPTED" || b.status === "ON_THE_WAY" || b.status === "STARTED"
  );
  
  const completedBookings = bookings.filter((b: any) => 
    b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Dashboard Header Banner */}
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-3xs uppercase bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-primary-foreground">Customer Hub</span>
              <h1 className="text-2xl font-black">Welcome, {user?.name}!</h1>
              <p className="text-xs text-white/80 leading-snug max-w-md">Track ongoing home service repairs, access transaction logs, and manage verification profiles.</p>
            </div>
            
            {/* Quick Balance indicator */}
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                <Wallet className="h-5 w-5 text-white/85 mx-auto mb-1.5" />
                <p className="text-4xs text-white/80 uppercase font-black tracking-wider">Refund Wallet</p>
                <p className="text-lg font-black mt-0.5">₹{wallet.balance}</p>
              </div>
            </div>
          </div>

          {/* Grid Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Main Portals (Bookings listings) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Bookings stepper */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Active Service Bookings ({activeBookings.length})
                </h2>

                {loadingData ? (
                  <div className="flex items-center justify-center p-12 bg-card border border-border rounded-2xl">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((b: any) => (
                      <div 
                        key={b.id}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div>
                            <span className="text-4xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                              {b.serviceName}
                            </span>
                            <h3 className="font-bold text-xs mt-1 text-foreground">With {b.provider.name}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-3xs uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                              {b.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-3xs text-muted-foreground font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{b.date}</p>
                          <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{b.time}</p>
                          <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" />{b.address}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <span className="text-3xs text-muted-foreground">Booking Fee: <b>₹{b.bookingFee}</b></span>
                          <button
                            onClick={() => router.push(`/customer/booking/${b.id}`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-3 py-1.5 text-3xs font-bold transition-all cursor-pointer"
                          >
                            Track & Manage <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-dashed border-border p-8 rounded-2xl text-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground">You don't have any active service requests.</p>
                    <button 
                      onClick={() => router.push("/search")}
                      className="rounded-lg bg-secondary text-primary hover:bg-primary/10 px-4 py-1.5 text-3xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      Book a Service
                    </button>
                  </div>
                )}
              </div>

              {/* Past bookings history */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground">Completed Services & History</h2>
                
                {completedBookings.length > 0 ? (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-secondary/50 text-muted-foreground text-4xs uppercase font-bold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Booking ID</th>
                          <th className="px-4 py-3">Provider</th>
                          <th className="px-4 py-3">Service</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedBookings.map((b: any) => (
                          <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-semibold text-muted-foreground">#{b.id.slice(0, 8)}</td>
                            <td className="px-4 py-3 font-bold text-foreground">{b.provider.name}</td>
                            <td className="px-4 py-3">{b.serviceName}</td>
                            <td className="px-4 py-3">{b.date}</td>
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
                                <FileText className="h-3.5 w-3.5" /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-card border border-border p-6 rounded-2xl text-center text-xs text-muted-foreground">
                    No past service history available.
                  </div>
                )}
              </div>

            </div>

            {/* Right Panel widgets (Notifications, Saved pros) */}
            <div className="space-y-6">
              
              {/* Notification Center */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications Center
                </h3>
                <div className="space-y-3.5">
                  {notifications.map((n: any) => (
                    <div key={n.id} className="border-b border-border pb-3 last:border-0 last:pb-0 space-y-1">
                      <p className="text-3xs text-foreground font-semibold leading-relaxed">{n.text}</p>
                      <span className="text-4xs text-muted-foreground block">{n.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Professionals */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Saved Professionals
                </h3>
                <div className="space-y-3">
                  {savedPros.map((pro: any) => (
                    <div key={pro.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <img src={pro.avatar} alt={pro.name} className="h-9 w-9 rounded-full object-cover" />
                        <div>
                          <p className="text-3xs font-bold text-foreground leading-snug">{pro.name}</p>
                          <p className="text-4xs text-muted-foreground mt-0.5">{pro.skill}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/search?category=${encodeURIComponent(pro.skill)}`)}
                        className="rounded-lg border border-border px-2.5 py-1 text-4xs font-bold hover:border-primary hover:text-primary transition-all cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
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
