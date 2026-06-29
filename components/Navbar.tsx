"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  Search,
  Hammer
} from "lucide-react";

export default function Navbar() {
  const { user, authenticated, logout, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Custom styling depending on active path
  const linkClass = (path: string) => `
    relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary
    ${isActive(path) ? "text-primary" : "text-muted-foreground"}
  `;

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "PROVIDER") return "/provider/dashboard";
    return "/customer/dashboard";
  };

  const isDashboardRoute = 
    pathname.startsWith("/admin/dashboard") || 
    pathname.startsWith("/provider/dashboard") || 
    pathname.startsWith("/customer/dashboard");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
              <span className="tracking-tight text-foreground">
                Local<span className="text-primary font-black">Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {!isDashboardRoute && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className={linkClass("/")}>Home</Link>
              <Link href="/services" className={linkClass("/services")}>All Services</Link>
              <Link href="/search" className={linkClass("/search")}>Search Professionals</Link>
              <Link href="/become-provider" className={linkClass("/become-provider")}>Become a Provider</Link>
              <Link href="/faq" className={linkClass("/faq")}>FAQ</Link>
            </nav>
          )}

          {/* Action Area */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Auth section */}
            {authenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pr-3 text-sm hover:border-primary transition-all cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline font-medium max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground">Logged in as</p>
                      <p className="font-semibold text-sm truncate">{user.email}</p>
                      <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/customer"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/become-provider"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isDashboardRoute && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isDashboardRoute && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2 animate-in slide-in-from-top-5 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
          >
            Home
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
          >
            All Services
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
          >
            Search Professionals
          </Link>
          <Link
            href="/become-provider"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
          >
            Become a Provider
          </Link>
          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
          >
            FAQ
          </Link>
          {!authenticated && (
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <Link
                href="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg px-4 py-2 text-sm font-medium border border-border hover:bg-secondary"
              >
                Log In
              </Link>
              <Link
                href="/become-provider"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
