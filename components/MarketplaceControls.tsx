"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";

interface MarketplaceControlsProps {
  currentSearch: string;
  currentCategory: string;
  currentLocation: string;
  currentSort: string;
}

export default function MarketplaceControls({
  currentSearch,
  currentCategory,
  currentLocation,
  currentSort,
}: MarketplaceControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const towns = ["Kumasi Central", "Mampong", "Obuasi", "Ejura", "Konongo", "Bekwai", "Offinso"];
  const categories = ["All", "Tomatoes", "Pepper", "Garden Eggs", "Okra", "Cabbage", "Lettuce", "Spinach", "Onions"];

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl border shadow-sm relative">
      {/* Loading overlay during transition */}
      {isPending && (
        <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
            Search produce
          </label>
          <div className="relative">
            <input
              type="text"
              defaultValue={currentSearch}
              placeholder="Search by name, category, or farmer..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilters({ search: e.currentTarget.value });
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Location Proximity Reference */}
        <div>
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
            Proximity Location
          </label>
          <div className="relative">
            <select
              value={currentLocation}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20 appearance-none font-semibold text-slate-700"
            >
              {towns.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Sort order */}
        <div>
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
            Sort Order
          </label>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20 appearance-none text-slate-700"
            >
              <option value="recommended">⭐ Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="freshness">Freshness First</option>
              <option value="proximity">Closest Proximity</option>
            </select>
            <SlidersHorizontal className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Category Tags scrollable list */}
      <div className="border-t pt-4">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
          Category Filters
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted">
          {categories.map((category) => {
            const isActive = currentCategory === category || (category === "All" && currentCategory === "");
            return (
              <button
                key={category}
                onClick={() => updateFilters({ category: category === "All" ? "" : category })}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/10"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
