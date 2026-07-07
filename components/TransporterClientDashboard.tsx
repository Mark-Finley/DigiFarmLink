"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { acceptTransportRequestAction, updateTransportStatusAction } from "@/app/actions/transport";
import { Truck, Landmark, User, MapPin, Phone, ShieldCheck, ArrowRight, ClipboardCheck, Sparkles, Navigation, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

// Dynamically import the Leaflet map component to prevent SSR failures
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[450px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground text-xs font-semibold border">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Loading route geometry...
    </div>
  ),
});

export interface TransportJob {
  id: string;
  order_id: string;
  transporter_id: string | null;
  status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered";
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_address: string;
  fare: number;
  created_at: string;
  order?: {
    buyer?: {
      full_name: string;
      phone_number: string;
    };
    farmer?: {
      full_name: string;
      phone_number: string;
    };
  };
}

interface DashboardProps {
  profile: {
    full_name: string;
    location_name: string;
  };
  pendingRequests: TransportJob[];
  activeRequest: TransportJob | null;
  completedRequestsCount: number;
  totalEarnings: number;
}

export default function TransporterClientDashboard({
  profile,
  pendingRequests,
  activeRequest,
  completedRequestsCount,
  totalEarnings,
}: DashboardProps) {
  const [selectedJob, setSelectedJob] = useState<TransportJob | null>(
    activeRequest || pendingRequests[0] || null
  );
  const [isPending, startTransition] = useTransition();

  const handleAcceptJob = (jobId: string) => {
    startTransition(async () => {
      await acceptTransportRequestAction(jobId);
      // Wait for page revalidation; activeRequest will load and update dashboard state
    });
  };

  const handleUpdateStatus = (jobId: string, nextStatus: "picked_up" | "in_transit" | "delivered") => {
    startTransition(async () => {
      await updateTransportStatusAction(jobId, nextStatus);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary animate-bounce" style={{ animationDuration: '3s' }} />
          <span className="font-extrabold text-lg text-primary">Logistics Portal</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Dispatch Space */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Welcome & Earnings Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-5 sm:p-6 border rounded-2xl shadow-sm">
          <div className="flex flex-col justify-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome back, {profile.full_name || "Transporter"}!
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              Ashanti Corridor Fleet Hub: <span className="font-bold text-slate-700">{profile.location_name}</span>
            </p>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block">Completed Deliveries</span>
              <span className="text-2xl font-black text-emerald-700">{completedRequestsCount} routes</span>
            </div>
            <ClipboardCheck className="h-8 w-8 text-emerald-500" />
          </div>

          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-primary uppercase font-black tracking-wider block">Fleet Earnings</span>
              <span className="text-2xl font-black text-primary">{totalEarnings.toFixed(2)} GHS</span>
            </div>
            <Landmark className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Grid layout splitting job ledger from interactive map previewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Job Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Delivery Route Panel */}
            <div className="space-y-3">
              <h2 className="font-extrabold text-sm uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-500 animate-pulse" />
                Active Route Job
              </h2>

              {activeRequest ? (
                <div
                  onClick={() => setSelectedJob(activeRequest)}
                  className={`bg-card border-2 p-5 rounded-2xl shadow-sm cursor-pointer transition-all hover:shadow-md space-y-4 ${
                    selectedJob?.id === activeRequest.id ? "border-primary" : "border-sky-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black tracking-wider uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                        Active Job Status: {activeRequest.status.replace("_", " ")}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">Job #{activeRequest.id.slice(0, 8)}</h4>
                    </div>
                    <span className="text-base font-black text-primary">{activeRequest.fare} GHS</span>
                  </div>

                  <div className="text-xs space-y-1.5 text-muted-foreground border-y py-3">
                    <p className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Pickup: <span className="font-bold text-slate-800">{activeRequest.pickup_address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      Delivery: <span className="font-bold text-slate-800">{activeRequest.delivery_address}</span>
                    </p>
                  </div>

                  {/* Actions depending on route status */}
                  <div className="flex gap-2 pt-1">
                    {activeRequest.status === "accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(activeRequest.id, "picked_up")}
                        disabled={isPending}
                        className="w-full text-xs font-bold bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Mark Picked Up from Farm</span>
                      </button>
                    )}
                    {activeRequest.status === "picked_up" && (
                      <button
                        onClick={() => handleUpdateStatus(activeRequest.id, "in_transit")}
                        disabled={isPending}
                        className="w-full text-xs font-bold bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Mark In Transit to Buyer</span>
                      </button>
                    )}
                    {activeRequest.status === "in_transit" && (
                      <button
                        onClick={() => handleUpdateStatus(activeRequest.id, "delivered")}
                        disabled={isPending}
                        className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 border border-emerald-600"
                      >
                        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Complete Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card border rounded-2xl p-5 text-center text-xs text-muted-foreground italic">
                  No active delivery job routes at the moment. Accept an available haul job below to start.
                </div>
              )}
            </div>

            {/* Available haul requests */}
            <div className="space-y-3">
              <h2 className="font-extrabold text-sm uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Available Dispatch Offers ({pendingRequests.length})
              </h2>

              {pendingRequests.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {pendingRequests.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`bg-card border p-4 rounded-xl cursor-pointer hover:shadow transition-all space-y-3 flex flex-col justify-between ${
                        selectedJob?.id === job.id ? "border-primary shadow-sm" : "border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Job #{job.id.slice(0, 8)}</h4>
                          <span className="text-[10px] text-muted-foreground">Order Ref: {job.order_id.slice(0, 8)}...</span>
                        </div>
                        <span className="text-sm font-black text-primary">{job.fare} GHS</span>
                      </div>

                      <div className="text-[11px] space-y-1 text-muted-foreground border-t pt-2">
                        <p className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          From: <span className="font-semibold text-slate-700">{job.pickup_address}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                          To: <span className="font-semibold text-slate-700">{job.delivery_address}</span>
                        </p>
                      </div>

                      {/* Accept button visible only if selected and transporter has no active job */}
                      {!activeRequest && selectedJob?.id === job.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptJob(job.id);
                          }}
                          disabled={isPending}
                          className="w-full text-xs font-bold bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-1"
                        >
                          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          <span>Accept Haul Route</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border rounded-2xl p-8 text-center text-xs text-muted-foreground">
                  All corridor harvests are currently dispatched. Check back later for new route job requests.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Route Map Details (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {selectedJob ? (
              <div className="bg-card border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <Navigation className="h-4.5 w-4.5 text-primary" />
                    Haul Job Route Map Geometry
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visualizing distance between Ashanti agricultural nodes. Detailed addresses and contact listings.
                  </p>
                </div>

                {/* Leaflet Dynamic Route Map component */}
                <DeliveryMap
                  pickupLat={selectedJob.pickup_latitude}
                  pickupLon={selectedJob.pickup_longitude}
                  deliveryLat={selectedJob.delivery_latitude}
                  deliveryLon={selectedJob.delivery_longitude}
                  pickupAddress={selectedJob.pickup_address}
                  deliveryAddress={selectedJob.delivery_address}
                />

                {/* Contact phone ledger info sheets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <h5 className="font-bold text-emerald-800 uppercase tracking-wide">Farmer Contact</h5>
                    <p className="font-bold text-slate-800">{selectedJob.order?.farmer?.full_name || "Ashanti Crop Farmer"}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      {selectedJob.order?.farmer?.phone_number || "+233 (0) Farmer"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <h5 className="font-bold text-sky-800 uppercase tracking-wide">Buyer Contact</h5>
                    <p className="font-bold text-slate-800">{selectedJob.order?.buyer?.full_name || "Wholesale Retailer"}</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      {selectedJob.order?.buyer?.phone_number || "+233 (0) Buyer"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border rounded-2xl p-16 text-center space-y-3 shadow-sm min-h-[450px] flex flex-col items-center justify-center">
                <Navigation className="h-12 w-12 text-muted-foreground/50 animate-pulse" />
                <h4 className="font-bold text-slate-800 text-sm">Select a job for route preview</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Click on an active or available dispatch job from the feed list to initialize maps navigation and route coordinates overlays.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Transporter Dispatch Fleet Workspace.</p>
      </footer>
    </div>
  );
}
