"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard portals
  const isDashboardRoute = 
    pathname.startsWith("/admin/dashboard") || 
    pathname.startsWith("/provider/dashboard") || 
    pathname.startsWith("/customer/dashboard");

  if (isDashboardRoute) return null;

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
              <span className="tracking-tight text-foreground">
                Local<span className="text-primary font-black">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's premium marketplace for verified local service professionals. Connecting customers with qualified experts.
            </p>
            <div className="space-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Koramangala, Bengaluru, Karnataka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@localpro.in</span>
              </div>
            </div>
          </div>

          {/* Popular Services Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Popular Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?category=Electrician" className="text-muted-foreground hover:text-primary transition-colors">
                  Electrician
                </Link>
              </li>
              <li>
                <Link href="/search?category=Plumber" className="text-muted-foreground hover:text-primary transition-colors">
                  Plumbing Services
                </Link>
              </li>
              <li>
                <Link href="/search?category=House Cleaning" className="text-muted-foreground hover:text-primary transition-colors">
                  House Cleaning
                </Link>
              </li>
              <li>
                <Link href="/search?category=AC Repair" className="text-muted-foreground hover:text-primary transition-colors">
                  AC Installation & Repair
                </Link>
              </li>
              <li>
                <Link href="/search?category=Custom Painting" className="text-muted-foreground hover:text-primary transition-colors">
                  Custom Art & Painting
                </Link>
              </li>
              <li>
                <Link href="/search?category=Photo Printing" className="text-muted-foreground hover:text-primary transition-colors">
                  Custom Photo Printing
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Roles Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/customer" className="text-muted-foreground hover:text-primary transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link href="/become-provider" className="text-muted-foreground hover:text-primary transition-colors">
                  Register as Service Partner
                </Link>
              </li>
              <li>
                <Link href="/provider" className="text-muted-foreground hover:text-primary transition-colors">
                  Service Provider Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Administrator Dashboard
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy and Trust Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Trust & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Our Platform
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Secure Payments Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} LocalPro Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Security</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Sitemap</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Affiliates</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
