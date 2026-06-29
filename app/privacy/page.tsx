import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground border-b border-border pb-4">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">Last updated: June 29, 2026</p>

          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when registering as a customer or service provider, such as full name, email address, physical service addresses, mobile numbers, and bank details (UPI IDs). For service providers, we also collect KYC verification documents (Aadhaar cards and selfie portraits) to maintain marketplace integrity.
            </p>

            <h2 className="text-base font-bold text-foreground">2. Aadhaar & KYC Verification Privacy</h2>
            <p>
              Uploaded Aadhaar cards and selfie portraits are strictly processed for verification auditing by admin supervisors. These documents are never visible to public visitors or standard customers. Upon approval, only a 'Verified Partner' badge is displayed publicly.
            </p>

            <h2 className="text-base font-bold text-foreground">3. Location & Pincode Routing</h2>
            <p>
              The platform utilizes pincodes and area names to route booking requests. Service providers select their coverage area codes manually. Customers search by inputting area pincodes. Exact addresses are only revealed to a service provider once they explicitly accept the booking request.
            </p>

            <h2 className="text-base font-bold text-foreground">4. Payment Gateway Security</h2>
            <p>
              Online transactions for platform booking fees are processed via secure mock Razorpay payment protocols. We do not store card or banking passwords on our local SQLite files.
            </p>

            <h2 className="text-base font-bold text-foreground">5. Customer Contact Info</h2>
            <p>
              Phone numbers and precise location mappings are locked and only disclosed to the assigned professional upon request acceptance to guarantee customer privacy and prevent spam calling.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
