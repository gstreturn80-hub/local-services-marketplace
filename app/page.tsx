"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Paintbrush, 
  Grid, 
  Flame, 
  Wind, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  PenTool, 
  Palette, 
  Printer, 
  Image as ImageIcon, 
  Maximize, 
  UserSquare2,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Grid,
  Flame,
  Wind,
  Shield: ShieldCheck,
  RefreshCw,
  Sparkles,
  PenTool,
  Palette,
  Printer,
  Image: ImageIcon,
  Maximize,
  UserSquare2,
};

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredPros, setFeaturedPros] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // Fetch featured providers (we query providers and filter featured ones)
      const proRes = await fetch("/api/providers");
      if (proRes.ok) {
        const proData = await proRes.json();
        // Seed default features Ramesh & Amit as featured
        setFeaturedPros(proData.slice(0, 3));
      }

      // Fetch banners
      const bannerRes = await fetch("/api/seed"); // trigger a quick check or default banners
      // For simplicity, we define mockup banners if fetch fails or succeeds
      setBanners([
        {
          id: "1",
          imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000",
          title: "Monsoon Wiring Safety Checkup",
          desc: "Get 15% off electrical audits. Stay safe this rain season.",
          link: "/search?category=Electrician"
        },
        {
          id: "2",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000",
          title: "House Deep Cleaning Special",
          desc: "Full sanitization starting at just ₹1,999. Book today!",
          link: "/search?category=House Cleaning"
        }
      ]);
    } catch (e) {
      console.error("Error loading landing page data:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-500/10 via-background to-background py-20 lg:py-32">
          <div className="absolute inset-y-0 right-0 -z-10 w-full max-w-3xl translate-x-20 bg-blue-500/5 blur-3xl opacity-60 rounded-full" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider animate-pulse">
                <TrendingUp className="h-3.5 w-3.5" />
                No. 1 Trusted Local Service Hub
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
                Find & Book <span className="text-primary bg-clip-text">Verified</span> Local Service Professionals
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Connect with background-checked electricians, plumbers, painters, cleaners, and custom creative artisans instantly in your neighborhood.
              </p>
            </div>

            {/* Large Search Bar */}
            <div className="w-full max-w-4xl mx-auto pt-4">
              <SearchBar />
            </div>

            {/* Quick Hero Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-border">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary">100%</p>
                <p className="text-xs text-muted-foreground mt-1">Verified Partners</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary">₹49</p>
                <p className="text-xs text-muted-foreground mt-1">Low Booking Fee</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary">4.8★</p>
                <p className="text-xs text-muted-foreground mt-1">Average Pro Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary">15 Min</p>
                <p className="text-xs text-muted-foreground mt-1">Emergency Dispatch</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROMOTION BANNER CAROUSEL (MOCK) */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div 
                key={banner.id}
                className="relative overflow-hidden rounded-2xl aspect-[21/9] border border-border hover:shadow-lg transition-all group cursor-pointer"
              >
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 sm:p-8 flex flex-col justify-center text-white space-y-2">
                  <span className="text-3xs uppercase font-extrabold tracking-widest text-primary-foreground bg-primary px-2 py-0.5 rounded w-max">Exclusive Offer</span>
                  <h3 className="text-lg sm:text-xl font-bold">{banner.title}</h3>
                  <p className="text-xs text-slate-300 max-w-[280px] leading-snug">{banner.desc}</p>
                  <Link 
                    href={banner.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-foreground hover:underline pt-2 w-max"
                  >
                    Book Now <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore Popular Categories</h2>
            <p className="text-sm text-muted-foreground">Select a professional service to see rates and available booking hours.</p>
          </div>

          {/* Home Services */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Home Maintenance & Repairs</h3>
              <Link href="/services" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.filter(c => c.type === "HOME").slice(0, 5).map((cat) => {
                const IconComponent = iconMap[cat.icon] || Zap;
                return (
                  <Link 
                    key={cat.id}
                    href={`/search?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover-lift text-center gap-3 cursor-pointer group"
                  >
                    <div className="p-4 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <IconComponent className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</h4>
                      <p className="text-4xs text-muted-foreground mt-1 truncate max-w-[120px]">{cat.description || "Verified pros"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Creative Services */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Creative & Custom Printing</h3>
              <Link href="/services" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.filter(c => c.type === "CREATIVE").slice(0, 6).map((cat) => {
                const IconComponent = iconMap[cat.icon] || Palette;
                return (
                  <Link 
                    key={cat.id}
                    href={`/search?category=${encodeURIComponent(cat.name)}`}
                    className="flex flex-col items-center justify-center p-5 bg-card border border-border rounded-xl hover-lift text-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-3 bg-blue-500/5 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <IconComponent className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors leading-tight">{cat.name}</h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-card border-y border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How LocalPro Works</h2>
              <p className="text-sm text-muted-foreground">Book trusted professionals in six simple steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
              {/* Stepper Steps */}
              {[
                { step: "01", title: "Search Service", desc: "Select the required service and input your area pincode." },
                { step: "02", title: "Choose Pro", desc: "Compare profiles, customer reviews, rating history, and experience." },
                { step: "03", title: "Schedule", desc: "Select a date and working hour slot that fits your schedule." },
                { step: "04", title: "Pay Fee", desc: "Pay a small platform booking fee (₹29-₹99) online securely." },
                { step: "05", title: "Job Completed", desc: "The verified professional completes the task at your location." },
                { step: "06", title: "Rate & Review", desc: "Pay the remaining amount directly to the pro and leave a rating." },
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col items-start bg-background border border-border rounded-xl p-5 relative shadow-sm hover:border-primary transition-colors">
                  <span className="text-2xl font-black text-primary/20 leading-none">{s.step}</span>
                  <h3 className="text-xs font-bold mt-2 text-foreground">{s.title}</h3>
                  <p className="text-3xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PROFESSIONALS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Professionals</h2>
            <p className="text-sm text-muted-foreground">Top-rated, background-checked professionals available in your city.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPros.length > 0 ? (
              featuredPros.map((pro) => (
                <div 
                  key={pro.id}
                  className="flex flex-col bg-card border border-border rounded-2xl p-6 shadow-md hover-lift gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-3xs font-medium text-emerald-500 border border-emerald-500/20">
                    <CheckCircle className="h-3 w-3 fill-emerald-500 text-white" />
                    Verified
                  </div>

                  <div className="flex items-center gap-4">
                    <img 
                      src={pro.user.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150"}
                      alt={pro.user.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-primary/10"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{pro.user.name}</h3>
                      <p className="text-3xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        Bengaluru
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{pro.rating}</span>
                        <span className="text-muted-foreground text-3xs font-normal">({pro.completedJobs} jobs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {pro.skills.split(",").map((skill: string, i: number) => (
                        <span 
                          key={i}
                          className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-3xs font-medium text-muted-foreground"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                    <p className="text-3xs text-muted-foreground leading-relaxed line-clamp-2">
                      {pro.bio || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div>
                      <p className="text-3xs text-muted-foreground">Experience</p>
                      <p className="text-xs font-bold text-foreground">{pro.experience} Years</p>
                    </div>
                    <Link
                      href={`/search?id=${pro.id}`}
                      className="rounded-lg bg-primary px-3 py-1.5 text-3xs font-bold text-primary-foreground hover:bg-primary/95 hover:shadow transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">
                Loading featured service providers...
              </div>
            )}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="bg-primary/5 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">Why Choose LocalPro?</h2>
              <p className="text-sm text-muted-foreground">Providing confidence and quality for every job, big or small.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Verified Professionals", desc: "We authenticate Government Aadhaar cards and selfie portraits for all professionals. Only approved profiles can accept work." },
                { title: "Transparent Pricing", desc: "Pay a minimal platform booking fee (₹29 to ₹99) online, then pay remaining labor fees directly to the provider. No hidden charges." },
                { title: "Area-Based Routing", desc: "Our advanced matching engine searches providers based on pincodes, guaranteeing that only near, available pros accept your request." },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-6 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                    <p className="text-3xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCAL ADVERTISEMENT COMPONENT */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="text-4xs uppercase bg-amber-500/10 px-2 py-0.5 rounded font-black text-amber-600 tracking-wider">Local Ad Partner</span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground leading-snug">Vardhman Hardware & Paints</h2>
              <p className="text-3xs text-muted-foreground leading-relaxed">
                Authorized dealer of Asian Paints, Syska LED, and Finolex Cables. Located right next to Koramangala Police Station. Show your LocalPro booking dashboard and get an extra 10% discount on raw material invoices!
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-xl border border-border bg-background px-4 py-2.5 text-center text-3xs font-semibold text-muted-foreground block">
                Koramangala, Bengaluru
              </span>
              <a 
                href="https://maps.google.com" 
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-foreground text-background px-4 py-2.5 text-center text-3xs font-bold hover:bg-foreground/90 transition-all cursor-pointer"
              >
                Locate Shop
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
