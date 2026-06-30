"use client";

import React from "react";
import { 
  Clock, 
  ThumbsUp, 
  Truck, 
  Play, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

interface BookingTrackerProps {
  status: string; // "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "STARTED" | "COMPLETED" | "CANCELLED"
}

export default function BookingTracker({ status }: BookingTrackerProps) {
  const steps = [
    { key: "PENDING", label: "Request Placed", icon: Clock, desc: "Waiting for provider acceptance" },
    { key: "ACCEPTED", label: "Accepted", icon: ThumbsUp, desc: "Provider has accepted the job" },
    { key: "ON_THE_WAY", label: "On the Way", icon: Truck, desc: "Professional is heading to your location" },
    { key: "STARTED", label: "Job Started", icon: Play, desc: "Work is actively in progress" },
    { key: "COMPLETED", label: "Completed", icon: CheckCircle2, desc: "Service completed successfully" },
  ];

  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 flex items-center gap-4 text-destructive">
        <XCircle className="h-8 w-8 shrink-0" />
        <div>
          <h3 className="font-bold text-base">Booking Cancelled</h3>
          <p className="text-sm opacity-90">This booking request has been cancelled by the user or the provider.</p>
        </div>
      </div>
    );
  }

  // Get index of the current status
  const currentIdx = steps.findIndex((s: { key: string }) => s.key === status);

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-md">
      <h3 className="font-bold text-lg mb-6 text-foreground">Service Progress</h3>
      
      {/* Stepper Timeline */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
        {/* Horizontal Line for Desktop */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block z-0" />

        {steps.map((step: { key: string; label: string; icon: React.ComponentType<any>; desc: string; }, idx: number) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div 
              key={step.key} 
              className="relative flex md:flex-col items-center md:text-center flex-1 gap-4 md:gap-2 z-10 w-full"
            >
              {/* Connector Line for Mobile */}
              {idx > 0 && (
                <div className="absolute left-6 bottom-full w-0.5 h-6 bg-border md:hidden" />
              )}

              {/* Step Circle */}
              <div 
                className={`
                  flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300
                  ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                  ${isCurrent ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : ""}
                  ${isPending ? "bg-card border-border text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>

              {/* Text Meta */}
              <div className="text-left md:text-center">
                <p 
                  className={`
                    text-sm font-bold transition-all
                    ${isCompleted ? "text-emerald-500 font-semibold" : ""}
                    ${isCurrent ? "text-primary font-extrabold" : ""}
                    ${isPending ? "text-muted-foreground" : ""}
                  `}
                >
                  {step.label}
                </p>
                <p className="text-3xs text-muted-foreground mt-0.5 max-w-[150px] leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
