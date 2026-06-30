"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is LocalPro and how does it work?",
      a: "LocalPro is an open marketplace matching consumers with local service professionals (electricians, cleaners, painters, printers, etc.). Customers search for services in their pincode, pick a verified professional, select scheduling slots, and pay a tiny platform booking fee. Once the job is completed, remaining labor costs are settled directly with the professional."
    },
    {
      q: "Is the platform booking fee refundable?",
      a: "The booking fee (ranging from ₹29 to ₹99) helps support background screening, billing systems, and hosting. The booking fee is non-refundable once the service provider accepts your schedule, unless the provider fails to show up or cancels the request from their end."
    },
    {
      q: "How are service professionals verified?",
      a: "Every service professional must undergo a strict KYC validation process. We require government-issued ID proofs (Aadhaar cards), selfie comparisons, and bank account verifications before awarding the 'Verified Partner' badge. Admin supervisors manually inspect all details."
    },
    {
      q: "How do I pay the professional for service?",
      a: "The booking fee is collected online during scheduling. The remaining labor amount (shown as estimated during booking) is settled directly with the service provider at your location. You can pay them via Cash, personal UPI, or any mutually agreed payment channel."
    },
    {
      q: "What if I need to cancel my booking?",
      a: "You can cancel your booking directly from your Customer Dashboard. If you cancel while the booking is still 'Pending' (waiting for provider acceptance), the booking fee is fully refunded. Once accepted, cancellations may attract policies depending on terms."
    },
    {
      q: "How do I join as a service professional?",
      a: "Visit our 'Become a Provider' page, fill in your personal contact details, skill categories, bank credentials, mock ID proofs, and pincode coverages. Once submitted, our admin team reviews your file within 24-48 hours. Upon approval, you will begin receiving customer bookings directly in your dashboard!"
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-primary" />
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              Have questions about booking, payments, or registrations? Find answers here.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq: { q: string; a: string; }, idx: number) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-secondary/50 transition-colors font-bold text-sm text-foreground cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50 bg-background/30 animate-in slide-in-from-top-1 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
