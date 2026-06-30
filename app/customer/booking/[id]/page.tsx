"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingTracker from "@/components/BookingTracker";
import { 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Star, 
  AlertCircle,
  FileText,
  CreditCard,
  MessageSquare
} from "lucide-react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated, loading } = useApp();

  const [booking, setBooking] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancel state
  const [cancelling, setCancelling] = useState(false);

  // Settle remaining payment state
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/customer");
    }
  }, [loading, authenticated]);

  useEffect(() => {
    if (authenticated) {
      fetchBookingDetails();
    }
  }, [authenticated, params.id]);

  const fetchBookingDetails = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`/api/bookings?id=${params.id}`);
      if (res.ok) {
        setBooking(await res.json());
      } else {
        setBooking(null);
      }
    } catch (e) {
      console.error(e);
      setBooking(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking? The platform fee will be refunded if the status is PENDING.")) return;
    try {
      setCancelling(true);
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "CANCELLED"
        })
      });
      if (res.ok) {
        await fetchBookingDetails();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to cancel booking.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  const handleSettlePayment = async () => {
    try {
      setSettling(true);
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          remainingPaymentStatus: "PAID"
        })
      });
      if (res.ok) {
        await fetchBookingDetails();
      } else {
        alert("Payment settlement failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSettling(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment,
        })
      });
      if (res.ok) {
        setReviewSubmitted(true);
        await fetchBookingDetails();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to submit review.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center space-y-3 p-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Booking Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested record is invalid or you do not have permissions to access it.</p>
          <button onClick={() => router.push("/customer/dashboard")} className="rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold">
            Back to Dashboard
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const isPending = booking.status === "PENDING";
  const isAccepted = booking.status === "ACCEPTED";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = booking.status === "CANCELLED";

  const totalAmount = booking.bookingFee + booking.remainingAmount;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-background py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <button 
              onClick={() => router.push(user?.role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard")} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <span className="text-3xs text-muted-foreground font-bold">Booking ID: #{booking.id.slice(0, 8)}</span>
          </div>

          {/* Booking Stepper Tracker */}
          <BookingTracker status={booking.status} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Split Details (Left) */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Details */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-foreground">Service Information</h3>
                
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <img 
                    src={user?.role === "PROVIDER" ? booking.customer.avatarUrl : booking.provider.avatarUrl} 
                    alt="Contact Avatar" 
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-3xs uppercase font-extrabold text-muted-foreground tracking-wider">
                      {user?.role === "PROVIDER" ? "Customer" : "Assigned Professional"}
                    </p>
                    <p className="font-bold text-xs text-foreground">
                      {user?.role === "PROVIDER" ? booking.customer.name : booking.provider.name}
                    </p>
                    <p className="text-3xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user?.role === "PROVIDER" ? booking.customer.customerProfile.phone : booking.provider.providerProfile.mobileNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="space-y-1">
                    <p className="text-4xs text-muted-foreground uppercase font-black">Requested Category</p>
                    <p className="text-foreground font-bold">{booking.serviceName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xs text-muted-foreground uppercase font-black">Address</p>
                    <p className="text-foreground">{booking.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xs text-muted-foreground uppercase font-black">Booking Time Slot</p>
                    <p className="text-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> {booking.date} 
                      <Clock className="h-3.5 w-3.5 text-primary ml-1" /> {booking.time}
                    </p>
                  </div>
                  {booking.notes && (
                    <div className="space-y-1 col-span-1 sm:col-span-2 border-t border-border pt-3">
                      <p className="text-4xs text-muted-foreground uppercase font-black">Issue Notes</p>
                      <p className="text-foreground italic font-medium">"{booking.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section on Completion */}
              {isCompleted && user?.role === "CUSTOMER" && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Leave Rating & Review
                  </h3>

                  {booking.reviews && booking.reviews.length > 0 ? (
                    <div className="border border-border/50 bg-secondary/10 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">Your Rating:</span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {booking.reviews[0].rating}★
                        </div>
                      </div>
                      <p className="text-3xs text-muted-foreground italic">"{booking.reviews[0].comment}"</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4 animate-in fade-in duration-200">
                      {/* Rating selector */}
                      <div className="space-y-1">
                        <label className="block text-3xs font-semibold uppercase text-muted-foreground">Select Rating Stars</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star: number) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`h-9 w-9 rounded-lg border font-black transition-all ${
                                rating >= star 
                                  ? "bg-amber-500 border-amber-500 text-white shadow-sm" 
                                  : "border-border text-muted-foreground bg-background"
                              }`}
                            >
                              {star}★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="space-y-1">
                        <label className="block text-3xs font-semibold uppercase text-muted-foreground">Feedback Comments</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Describe the speed, quality, and behavior of the professional..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                        <span>Submit Review</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* Invoices Details (Right) */}
            <div className="space-y-6">
              
              {/* Financial Breakup Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-md space-y-4">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  Invoice Billing
                </h3>

                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Online Booking Fee</span>
                    <span className="text-foreground">₹{booking.bookingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Labor Amount</span>
                    <span className="text-foreground">₹{booking.remainingAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                    <span className="text-foreground">Total Project Cost</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between text-3xs font-semibold">
                    <span className="text-muted-foreground uppercase tracking-wider">Booking Fee Status</span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-500 uppercase">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-3xs font-semibold">
                    <span className="text-muted-foreground uppercase tracking-wider">Remaining labor status</span>
                    <span className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                      booking.remainingPaymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {booking.remainingPaymentStatus}
                    </span>
                  </div>
                </div>

                {/* Settle Payment Action */}
                {isCompleted && booking.remainingPaymentStatus === "PENDING" && user?.role === "CUSTOMER" && (
                  <button
                    onClick={handleSettlePayment}
                    disabled={settling}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {settling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    <span>Mark remaining as PAID</span>
                  </button>
                )}

                {/* Cancel Booking Action */}
                {(isPending || isAccepted) && user?.role === "CUSTOMER" && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="w-full rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 py-2 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>Cancel Booking Request</span>
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
