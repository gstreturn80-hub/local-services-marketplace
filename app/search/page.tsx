"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Filter, 
  AlertTriangle, 
  Loader2, 
  ChevronRight, 
  User, 
  X,
  CreditCard,
  Notebook,
  Upload,
  ArrowLeft,
  Briefcase
} from "lucide-react";

interface SearchCategory {
  id: string;
  name: string;
}

interface SearchProvider {
  id: string;
  isVerified: boolean;
  rating: number;
  completedJobs: number;
  skills: string;
  bio: string | null;
  experience: number;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, authenticated } = useApp();

  // URL state
  const categoryParam = searchParams.get("category") || "";
  const pincodeParam = searchParams.get("pincode") || "";
  const cityParam = searchParams.get("city") || "";
  const areaParam = searchParams.get("area") || "";
  const searchQueryParam = searchParams.get("search") || "";
  const idParam = searchParams.get("id") || "";

  // Lists & data states
  const [providers, setProviders] = useState<SearchProvider[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter UI states
  const [filterCategory, setFilterCategory] = useState(categoryParam);
  const [filterPincode, setFilterPincode] = useState(pincodeParam);
  const [filterCity, setFilterCity] = useState(cityParam);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterAvailableToday, setFilterAvailableToday] = useState(false);
  const [filterAvailableNow, setFilterAvailableNow] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState("");

  // Booking form states
  const [bookingStep, setBookingStep] = useState(0); // 0: Idle/Closed, 1: Checkout Form, 2: Checkout Success
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingFee, setBookingFee] = useState(49); // default platform fee ₹49
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [newBookingId, setNewBookingId] = useState("");

  // Suggestion fallback pincodes if search returns 0
  const nearbyPincodes = ["560034", "560038", "560102"];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch providers when URL or filters change
  useEffect(() => {
    fetchProviders();
  }, [
    categoryParam, pincodeParam, cityParam, areaParam, searchQueryParam, idParam,
    filterCategory, filterPincode, filterCity, filterVerifiedOnly, 
    filterAvailableToday, filterAvailableNow, filterMinRating
  ]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      // If we are looking for a single detailed provider profile
      if (idParam) {
        const res = await fetch(`/api/providers?id=${idParam}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedProvider(data);
          // Auto-populate customer address if logged in
          if (user && user.customerProfile) {
            setBookingAddress(user.customerProfile.address || "");
          }
        }
        setLoading(false);
        return;
      }

      setSelectedProvider(null);

      // Build search URL
      let query = `/api/providers?`;
      const params: string[] = [];

      if (filterCategory) params.push(`category=${encodeURIComponent(filterCategory)}`);
      if (filterPincode) params.push(`pincode=${filterPincode}`);
      if (filterCity) params.push(`city=${encodeURIComponent(filterCity)}`);
      if (filterVerifiedOnly) params.push(`verified=true`);
      if (filterAvailableToday) params.push(`availableToday=true`);
      if (filterAvailableNow) params.push(`availableNow=true`);
      if (filterMinRating) params.push(`rating=${filterMinRating}`);
      if (searchQueryParam) params.push(`search=${encodeURIComponent(searchQueryParam)}`);

      query += params.join("&");

      const res = await fetch(query);
      if (res.ok) {
        setProviders(await res.json());
      }
    } catch (e) {
      console.error("Error fetching providers:", e);
    } finally {
      setLoading(false);
    }
  };

  // Submit booking request
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      router.push("/customer?redirect=" + encodeURIComponent(`/search?id=${idParam}`));
      return;
    }

    if (!bookingDate || !bookingTime || !bookingAddress) {
      alert("Please fill in date, time, and address fields.");
      return;
    }

    try {
      setBookingLoading(true);
      const bookingData = {
        providerId: selectedProvider.user.id,
        serviceName: filterCategory || selectedProvider.skills.split(",")[0],
        date: bookingDate,
        time: bookingTime,
        address: bookingAddress,
        notes: bookingNotes,
        bookingFee: bookingFee,
        paymentMethod: paymentMethod,
        remainingAmount: 399, // simulated standard remaining cost
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      if (res.ok) {
        setNewBookingId(data.id);
        setBookingStep(2);
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApplyPincodeSuggestion = (pin: string) => {
    setFilterPincode(pin);
  };

  const resetFilters = () => {
    setFilterCategory("");
    setFilterPincode("");
    setFilterCity("");
    setFilterVerifiedOnly(false);
    setFilterAvailableToday(false);
    setFilterAvailableNow(false);
    setFilterMinRating("");
    router.push("/search");
  };

  // IF DETAILED PROVIDER PROFILE ROUTE
  if (idParam && selectedProvider) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-background py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Back to Search */}
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to listings
            </button>

            {/* Profile Overview Card */}
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
              {selectedProvider.isVerified && (
                <div className="absolute top-6 right-6 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4 fill-emerald-500 text-white" />
                  Verified Partner
                </div>
              )}

              <img 
                src={selectedProvider.user.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200"}
                alt={selectedProvider.user.name}
                className="h-28 w-28 rounded-full object-cover border-4 border-primary/10 shadow-sm"
              />

              <div className="space-y-4 flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-foreground">{selectedProvider.user.name}</h1>
                  <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    Bengaluru Area
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-sm font-bold text-amber-500 pt-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{selectedProvider.rating || "New"}</span>
                    <span className="text-muted-foreground text-xs font-normal">
                      ({selectedProvider.completedJobs} completed tasks)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {selectedProvider.skills.split(",").map((skill: string, i: number) => (
                    <span key={i} className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto sm:mx-0 pt-2 text-center sm:text-left border-t border-border">
                  <div>
                    <p className="text-4xs text-muted-foreground uppercase font-black">Experience</p>
                    <p className="text-sm font-bold">{selectedProvider.experience} Years</p>
                  </div>
                  <div>
                    <p className="text-4xs text-muted-foreground uppercase font-black">Status</p>
                    <p className={`text-sm font-bold uppercase tracking-wider ${selectedProvider.status === "AVAILABLE" ? "text-emerald-500" : "text-amber-500"}`}>
                      {selectedProvider.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-4xs text-muted-foreground uppercase font-black">Platform Fee</p>
                    <p className="text-sm font-bold text-primary">₹49</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Split Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Details Panel */}
              <div className="md:col-span-2 space-y-6">
                
                {/* About Bio */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-foreground">About the Professional</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedProvider.bio || "This professional hasn't written a biography yet."}
                  </p>
                </div>

                {/* Schedule & Working Hours */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-foreground">Working Hours & Areas</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 border border-border p-3.5 rounded-xl bg-background">
                      <p className="font-bold text-muted-foreground uppercase tracking-wider text-4xs">Weekly Days Available</p>
                      <p className="font-medium text-foreground">{selectedProvider.workingDays}</p>
                    </div>
                    <div className="space-y-1.5 border border-border p-3.5 rounded-xl bg-background">
                      <p className="font-bold text-muted-foreground uppercase tracking-wider text-4xs">Timing Slots</p>
                      <p className="font-medium text-foreground">{selectedProvider.workingHoursStart} to {selectedProvider.workingHoursEnd}</p>
                    </div>
                  </div>

                  {/* Areas list */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-4xs">Covered Pincodes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProvider.serviceAreas && selectedProvider.serviceAreas.map((sa: any, i: number) => (
                        <span key={i} className="inline-flex rounded-md border border-border bg-background px-2 py-1 text-3xs font-semibold">
                          {sa.area} ({sa.pincode})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Portfolios Before & After */}
                {selectedProvider.portfolioItems && selectedProvider.portfolioItems.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-foreground">Work Portfolio & Certifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProvider.portfolioItems.map((item: any, i: number) => (
                        <div key={i} className="group relative overflow-hidden rounded-xl border border-border bg-background aspect-video">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title || "Portfolio Work"}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          {item.title && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-2 text-white text-3xs font-semibold text-center truncate">
                              {item.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ratings & Reviews Listing */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-foreground">Customer Reviews</h3>
                  <div className="space-y-4">
                    {selectedProvider.user?.reviewsAsProvider && selectedProvider.user.reviewsAsProvider.length > 0 ? (
                      selectedProvider.user.reviewsAsProvider.map((rev: any, i: number) => (
                        <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={rev.customer.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"} 
                                alt={rev.customer.name}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-xs font-bold text-foreground">{rev.customer.name}</p>
                                <p className="text-4xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-3xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No customer reviews yet. Be the first to book and leave a review!</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Checkout Panel */}
              <div className="space-y-6">
                {bookingStep === 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
                    <div className="text-center">
                      <p className="text-2xs text-muted-foreground uppercase font-black">Platform Booking Fee</p>
                      <p className="text-3xl font-black text-primary">₹{bookingFee}</p>
                      <p className="text-4xs text-muted-foreground mt-1">Paid online. Rest paid directly to professional.</p>
                    </div>

                    <button
                      onClick={() => setBookingStep(1)}
                      className="w-full rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-3 font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer text-center block"
                    >
                      Book Professional
                    </button>
                    
                    <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground border-t border-border pt-4">
                      <Phone className="h-4 w-4" />
                      <span>Support Hotline: 1800-PRO-HELP</span>
                    </div>
                  </div>
                )}

                {bookingStep === 1 && (
                  <form onSubmit={handleCreateBooking} className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-bold text-sm text-foreground">Confirm Booking Details</h3>
                      <button type="button" onClick={() => setBookingStep(0)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Date */}
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Select Date</label>
                      <input 
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Select Time Slot</label>
                      <input 
                        type="time"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Service Address</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House Number, Street Name, Landmark"
                        value={bookingAddress}
                        onChange={(e) => setBookingAddress(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Issue Description / Notes</label>
                      <textarea
                        rows={2}
                        placeholder="E.g. Regulator speed knob broken (Optional)"
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Pricing Breakup */}
                    <div className="border-t border-b border-border py-2 space-y-1.5 text-3xs font-semibold">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Booking Fee</span>
                        <span className="text-foreground">₹{bookingFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Labor Cost</span>
                        <span className="text-emerald-500 font-bold">₹350 - ₹500 (Pay Direct)</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Payment Method (Booking Fee)</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                        <option value="CARD">Credit / Debit Card</option>
                        <option value="WALLET">Digital Wallet</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Simulating Checkout...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span>Pay Booking Fee ₹{bookingFee}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {bookingStep === 2 && (
                  <div className="bg-card border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 shadow-md space-y-4 text-center animate-in scale-in duration-200">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                      <Star className="h-6 w-6 fill-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-foreground">Booking Confirmed!</h3>
                      <p className="text-3xs text-muted-foreground">
                        Simulated checkout successful. Your booking has been dispatched to {selectedProvider.user.name}.
                      </p>
                    </div>

                    <div className="bg-background rounded-lg border border-border p-3 text-3xs text-left font-semibold space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Booking ID:</span><span className="font-bold text-foreground">#{newBookingId.slice(0, 8)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Date / Time:</span><span className="text-foreground">{bookingDate} @ {bookingTime}</span></div>
                    </div>

                    <button
                      onClick={() => {
                        setBookingStep(0);
                        router.push(`/customer/dashboard`);
                      }}
                      className="w-full rounded-xl bg-foreground hover:bg-foreground/90 text-background py-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ELSE SEARCH DIRECTORY LIST VIEW
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-black text-foreground">Search Local Professionals</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Filter and book verified service providers near you.</p>
            </div>
            <button 
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 h-max">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Filter Options
                </h3>
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground">Service Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: SearchCategory) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Pincode Search */}
              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground">Area Pincode</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={filterPincode}
                  onChange={(e) => setFilterPincode(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground">City</label>
                <input
                  type="text"
                  placeholder="Enter City name"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Rating Slider */}
              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground">Minimum Rating</label>
                <select
                  value={filterMinRating}
                  onChange={(e) => setFilterMinRating(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Ratings</option>
                  <option value="4.5">4.5★ & Above</option>
                  <option value="4.0">4.0★ & Above</option>
                  <option value="3.5">3.5★ & Above</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterVerifiedOnly}
                    onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                  />
                  <span>Verified Badges Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAvailableToday}
                    onChange={(e) => setFilterAvailableToday(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                  />
                  <span>Available Today</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAvailableNow}
                    onChange={(e) => setFilterAvailableNow(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                  />
                  <span>Available Now (Working Hours)</span>
                </label>
              </div>

            </div>

            {/* Providers List Output */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">Searching database for matching professionals...</p>
                </div>
              ) : providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {providers.map((pro: SearchProvider) => (
                    <div 
                      key={pro.id}
                      className="bg-card border border-border rounded-2xl p-5 shadow-sm hover-lift flex flex-col gap-4 relative overflow-hidden"
                    >
                      {pro.isVerified && (
                        <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-3xs font-medium text-emerald-500 border border-emerald-500/20">
                          <ShieldCheck className="h-3.5 w-3.5 fill-emerald-500 text-white" />
                          Verified
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <img
                          src={pro.user.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150"}
                          alt={pro.user.name}
                          className="h-14 w-14 rounded-full object-cover border border-border"
                        />
                        <div>
                          <h3 className="font-bold text-xs text-foreground">{pro.user.name}</h3>
                          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 mt-0.5">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span>{pro.rating || "New"}</span>
                            <span className="text-muted-foreground text-3xs font-normal">({pro.completedJobs} jobs)</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {pro.skills.split(",").map((skill: string, i: number) => (
                            <span key={i} className="inline-flex rounded bg-secondary px-1.5 py-0.5 text-3xs font-medium text-muted-foreground">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                        <p className="text-3xs text-muted-foreground leading-relaxed line-clamp-2">
                          {pro.bio || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                        <div className="text-3xs text-muted-foreground">
                          <p>Experience</p>
                          <span className="font-bold text-foreground text-xs">{pro.experience} Years</span>
                        </div>
                        <button
                          onClick={() => {
                            router.push(`/search?id=${pro.id}${filterCategory ? `&category=${encodeURIComponent(filterCategory)}` : ""}`);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-3xs font-bold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
                        >
                          View & Book <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback State: No Providers Found */
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-8 w-8" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="font-bold text-lg text-foreground">No professionals available in this area code</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We currently do not have matching service providers in {filterPincode ? `"${filterPincode}"` : "your selected location"}.
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-background rounded-xl border border-border p-5 max-w-md mx-auto text-left space-y-3.5">
                    <p className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">What you can do:</p>
                    <div className="space-y-2.5 text-xs text-muted-foreground leading-snug">
                      <p>
                        💡 Try searching for nearby pincodes in the city:{" "}
                        <span className="flex gap-2 mt-1">
                          {nearbyPincodes.map((pin: string) => (
                            <button
                              key={pin}
                              onClick={() => handleApplyPincodeSuggestion(pin)}
                              className="px-2 py-0.5 bg-secondary text-primary font-semibold rounded hover:underline hover:bg-primary/10 transition-colors"
                            >
                              {pin}
                            </button>
                          ))}
                        </span>
                      </p>
                      <p>🗓️ Schedule a future booking and our backend supervisor will attempt to dispatch a provider from adjacent districts.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
