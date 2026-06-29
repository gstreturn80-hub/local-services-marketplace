import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Target, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About LocalPro</h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              We are a modern services platform built to bridge the gap between verified local independent professionals and homeowners.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4 flex-1">
              <h2 className="text-xl font-bold text-foreground">Our Core Mission</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LocalPro acts strictly as an open marketplace. Unlike other service conglomerates, we do not employ professionals nor dictate arbitrary labor tariffs. 
                Our goal is to give independent electricians, plumbers, masons, and creative artists the tools to run their own business, while giving consumers security via strict Aadhaar ID validation and area-based transparent routing.
              </p>
            </div>
            <div className="w-full md:w-80 h-48 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center p-6 text-center">
              <div className="space-y-2">
                <Target className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-bold text-xs">Direct Settlements</h3>
                <p className="text-4xs text-muted-foreground leading-normal">Pay directly to professionals. Zero percentage cut on your labor wages.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-2xl space-y-3 shadow-2xs">
              <ShieldCheck className="h-7 w-7 text-primary" />
              <h3 className="font-bold text-xs text-foreground">Strict KYC Verification</h3>
              <p className="text-3xs text-muted-foreground leading-relaxed">
                No provider appears in search results without government identity audit and matching facial portrait verification.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl space-y-3 shadow-2xs">
              <Award className="h-7 w-7 text-primary" />
              <h3 className="font-bold text-xs text-foreground">Premium Client Standards</h3>
              <p className="text-3xs text-muted-foreground leading-relaxed">
                Simple visual status tracking. Clear receipt generation. Safe online booking fee checkouts.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl space-y-3 shadow-2xs">
              <Users className="h-7 w-7 text-primary" />
              <h3 className="font-bold text-xs text-foreground">Empowering Artisans</h3>
              <p className="text-3xs text-muted-foreground leading-relaxed">
                From hand-drawn portrait painters to banners and plumbers, we support local micro-enterprises and local hardware stores.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
