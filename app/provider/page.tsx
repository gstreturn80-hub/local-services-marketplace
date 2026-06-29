"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";

export default function ProviderLoginPage() {
  const router = useRouter();
  const { login, authenticated, user } = useApp();

  useEffect(() => {
    if (authenticated && user) {
      if (user.role === "PROVIDER") {
        router.push("/provider/dashboard");
      } else if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    }
  }, [authenticated, user]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/provider/dashboard");
      } else {
        setError(res.error || "Login failed. Check credentials.");
      }
    } catch (e) {
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
          
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Service Partner Sign In</h1>
            <p className="text-xs text-muted-foreground">Sign in to manage your schedule, wallet, and accept service requests.</p>
          </div>

          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
            {error && (
              <p className="text-3xs text-destructive font-semibold border border-destructive/10 bg-destructive/5 p-3 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-3xs font-semibold uppercase text-muted-foreground">Partner Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="electrician@test.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

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
                <span>Sign In</span>
              </button>
            </form>

            <div className="text-center pt-4 border-t border-border text-xs space-y-2">
              <p className="text-muted-foreground">Not a registered partner yet?</p>
              <button
                onClick={() => router.push("/become-provider")}
                className="text-primary font-bold hover:underline"
              >
                Apply as Service Provider
              </button>
            </div>

            {/* Quick Demo Login Credentials */}
            <div className="border-t border-border pt-4 text-3xs space-y-1 text-muted-foreground bg-secondary/20 p-3 rounded-lg">
              <p className="font-bold text-foreground">💡 Fast Demo credentials:</p>
              <p>Email: <span className="font-bold select-all text-primary">electrician@test.com</span> (Verified Electrician)</p>
              <p>Email: <span className="font-bold select-all text-primary">plumber@test.com</span> (Pending Plumber)</p>
              <p>Password: <span className="font-bold select-all text-primary">password123</span></p>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
