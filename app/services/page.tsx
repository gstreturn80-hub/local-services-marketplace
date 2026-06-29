"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  ArrowRight,
  Search,
  CheckCircle2
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

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const homeServices = filteredCategories.filter(c => c.type === "HOME");
  const creativeServices = filteredCategories.filter(c => c.type === "CREATIVE");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">Explore Our Services</h1>
            <p className="text-sm text-muted-foreground">
              Browse through our range of professional home services and custom creative work. Select a category to search available providers.
            </p>

            {/* Quick search input */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search categories (e.g. Electrician, Printing)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-sm text-muted-foreground">
              Loading service catalog...
            </div>
          ) : (
            <div className="space-y-12">
              {/* Home Services Section */}
              {homeServices.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-xl font-bold text-foreground">Home Services & Maintenance</h2>
                    <p className="text-xs text-muted-foreground">Reliable services to keep your household running smoothly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {homeServices.map((cat) => {
                      const IconComponent = iconMap[cat.icon] || Zap;
                      return (
                        <div 
                          key={cat.id}
                          className="flex gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary transition-all shadow-sm hover:shadow"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                              <p className="text-3xs text-muted-foreground leading-relaxed">{cat.description}</p>
                            </div>
                            <Link 
                              href={`/search?category=${encodeURIComponent(cat.name)}`}
                              className="text-2xs font-bold text-primary hover:underline flex items-center gap-1 mt-auto w-max"
                            >
                              Find Professionals <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Creative Services Section */}
              {creativeServices.length > 0 && (
                <div className="space-y-6">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-xl font-bold text-foreground">Artistic & Creative Print Services</h2>
                    <p className="text-xs text-muted-foreground">Custom portraits, framing, printing, and design works.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creativeServices.map((cat) => {
                      const IconComponent = iconMap[cat.icon] || Palette;
                      return (
                        <div 
                          key={cat.id}
                          className="flex gap-4 p-5 bg-card border border-border rounded-2xl hover:border-blue-600 transition-all shadow-sm hover:shadow"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                              <p className="text-3xs text-muted-foreground leading-relaxed">{cat.description}</p>
                            </div>
                            <Link 
                              href={`/search?category=${encodeURIComponent(cat.name)}`}
                              className="text-2xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-auto w-max"
                            >
                              Find Print Shops <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredCategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                  No service categories found matching "{search}".
                </div>
              )}
            </div>
          )}

          {/* Core Guarantees Banner */}
          <div className="bg-primary/5 rounded-3xl p-6 sm:p-10 border border-primary/10">
            <h3 className="text-center font-bold text-lg mb-6">Our Local Service Standards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                <h4 className="font-bold text-xs text-foreground">KYC Verified Profiles</h4>
                <p className="text-3xs text-muted-foreground">Every service partner must pass Aadhaar checks and selfie verification.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                <h4 className="font-bold text-xs text-foreground">Zero Platform Markup</h4>
                <p className="text-3xs text-muted-foreground">Pay a small platform booking fee online. Settle work amounts directly with providers.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                <h4 className="font-bold text-xs text-foreground">Pincode Routing</h4>
                <p className="text-3xs text-muted-foreground">Only view partners covering your area code. No distant travel fee surprises.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
