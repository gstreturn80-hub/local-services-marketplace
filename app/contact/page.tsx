"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">Contact Customer Care</h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Get in touch with our operations support or report safety, payment, or provider discrepancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact details */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-base text-foreground">Corporate Office</h3>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">LocalPro HQ</p>
                    <p>Flat 204, Alpine Heights, Koramangala 4th Block, Bengaluru, Karnataka - 560034</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Phone Support</p>
                    <p>+91 98765 43210</p>
                    <p>1800-PRO-HELP (Toll Free)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Email Support</p>
                    <p>support@localpro.in</p>
                    <p>partners@localpro.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Message Form */}
            <div className="md:col-span-2 bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <h3 className="font-bold text-base text-foreground">Message Sent Successfully!</h3>
                  <p className="text-3xs text-muted-foreground max-w-sm">
                    Thank you for contacting us. A support supervisor has received your request and will reply back to your email within 2 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold hover:border-primary transition-colors cursor-pointer"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold text-base text-foreground">Send an Enquiry</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Rohan Verma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-3xs font-semibold uppercase text-muted-foreground">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="name@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Subject</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="E.g. Payment failed but amount debited"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-3xs font-semibold uppercase text-muted-foreground">Message / Explanation</label>
                    <textarea 
                      rows={4} 
                      required 
                      placeholder="Describe your issue in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
