import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground border-b border-border pb-4">Terms & Conditions</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">Last updated: June 29, 2026</p>

          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <h2 className="text-base font-bold text-foreground">1. Marketplace Limitation</h2>
            <p>
              LocalPro operates exclusively as a matchmaking marketplace platform. We do not provide physical home services directly. Service agreements are formed directly between the customer and the independent service professional. LocalPro is not liable for structural damage, missing properties, or incomplete work.
            </p>

            <h2 className="text-base font-bold text-foreground">2. Booking Fee Policy</h2>
            <p>
              Every booking dispatch requires a small platform fee (₹29 to ₹99) to cover processing and screening audits. The booking fee is collected online and is non-refundable after a service provider accepts the slot. If a provider cancels or fails to arrive, the fee is fully refunded to the customer's account logs.
            </p>

            <h2 className="text-base font-bold text-foreground">3. Direct Settlements</h2>
            <p>
              The remaining service cost is settled directly between the customer and the provider at the site of work. LocalPro does not take commissions on these on-site cash/UPI settlements. It is the customer's duty to inspect quality before final direct payment.
            </p>

            <h2 className="text-base font-bold text-foreground">4. Provider Verification</h2>
            <p>
              While LocalPro audits Government Aadhaar details and portraits, customers are encouraged to verify identity credentials at the door before letting service professionals enter the house.
            </p>

            <h2 className="text-base font-bold text-foreground">5. Service Review Rules</h2>
            <p>
              Customers can leave reviews and ratings for completed services. Reviews must be honest, accurate, and free of vulgar language. LocalPro reserves the right to remove reviews that violate communication guidelines.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
