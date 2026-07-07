import { ShoppingBag, Tag, Star, MapPin, Calendar } from "lucide-react";

export default function MarketplaceLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Sticky Header mockup */}
      <div className="h-16 border-b bg-card w-full" />

      {/* Hero Header Mockup */}
      <section className="bg-gradient-to-b from-green-50/40 to-transparent pt-12 pb-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-9 w-80 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-7 w-48 bg-slate-200 animate-pulse rounded-full" />
        </div>
      </section>

      {/* Controls Mockup */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-28 bg-card border rounded-2xl animate-pulse shadow-sm" />

        {/* Listings Grid Shimmer Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[390px] animate-pulse"
            >
              {/* Shimmer Image */}
              <div className="w-full h-44 bg-slate-200" />

              {/* Shimmer Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                </div>

                <div className="space-y-2 border-y py-3">
                  <div className="h-3 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-36 bg-slate-200 rounded" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-1">
                    <div className="h-5 w-20 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Mockup */}
      <div className="h-32 border-t bg-card mt-12 w-full" />
    </div>
  );
}
