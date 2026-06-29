"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, Loader2 } from "lucide-react";

function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/customer/dashboard";
  const { login, signup, authenticated, user } = useApp();

  // Redirect if already logged in as customer
  useEffect(() => {
    if (authenticated && user) {
      if (user.role === "CUSTOMER") {
        router.push(redirect);
      } else if (user.role === "PROVIDER") {
        router.push("/provider/dashboard");
      } else if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }
  }, [authenticated, user, redirect]);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          router.push(redirect);
        } else {
          setError(res.error || "Login failed");
        }
      } else {
        const signupData = {
          email,
          password,
          name,
          role: "CUSTOMER",
          phone,
          address
        };
        const res = await signup(signupData);
        if (res.success) {
          router.push(redirect);
        } else {
          setError(res.error || "Signup failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4 space-y-6">
          
          {/* Logo brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-foreground">
              {isLogin ? "Customer Portal Sign In" : "Create Customer Account"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Log in to track your bookings and invoices." : "Sign up to start booking verified home service professionals."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
            {error && (
              <p className="text-3xs text-destructive font-semibold border border-destructive/10 bg-destructive/5 p-3 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1">
                  <label className="block text-3xs font-semibold uppercase text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      required 
                      placeholder="Rohan Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-3xs font-semibold uppercase text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    required 
                    placeholder="customer@test.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="tel" 
                        required 
                        placeholder="9876543200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Home Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <textarea 
                        required 
                        rows={2}
                        placeholder="Flat No, Street, City, State"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-3xs font-semibold uppercase text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{isLogin ? "Sign In" : "Sign Up"}</span>
              </button>
            </form>

            <div className="text-center pt-4 border-t border-border text-xs">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
            
            {/* Quick Demo Logins Helper */}
            {isLogin && (
              <div className="border-t border-border pt-4 text-3xs space-y-1 text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                <p className="font-bold text-foreground">💡 Fast Demo login:</p>
                <p>Email: <span className="font-bold select-all text-primary">customer@test.com</span></p>
                <p>Password: <span className="font-bold select-all text-primary">password123</span></p>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <CustomerAuthContent />
    </Suspense>
  );
}
