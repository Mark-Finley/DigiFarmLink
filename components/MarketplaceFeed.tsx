"use client";

import { useState, useEffect } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import { Eye, Tag, Star, MapPin, Calendar, ShoppingBag, WifiOff } from "lucide-react";
import Link from "next/link";
import { getProduceImageUrl } from "@/utils/images";

interface FeedProps {
  initialProduce: any[];
  search: string;
  category: string;
  location: string;
  sort: string;
  buyerLocation: string;
}

export default function MarketplaceFeed({
  initialProduce,
  search,
  category,
  location,
  sort,
  buyerLocation,
}: FeedProps) {
  const [produce, setProduce] = useState<any[]>(initialProduce);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkConnection = () => {
      if (!navigator.onLine) {
        setIsOfflineMode(true);
        const cached = localStorage.getItem("farmlink_marketplace_cache");
        if (cached) {
          try {
            setProduce(JSON.parse(cached));
          } catch (e) {
            console.error("Failed to parse cached produce:", e);
          }
        }
      } else {
        setIsOfflineMode(false);
        setProduce(initialProduce);
        if (initialProduce && initialProduce.length > 0) {
          localStorage.setItem("farmlink_marketplace_cache", JSON.stringify(initialProduce));
        }
      }
    };

    checkConnection();

    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);

    if (search) {
      localStorage.setItem("farmlink_last_search", search);
    }

    return () => {
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, [initialProduce, search]);

  // Apply filter and sort client-side only when browser is offline
  let displayList = produce;
  if (isOfflineMode) {
    if (category) {
      displayList = displayList.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (search) {
      const q = search.toLowerCase();
      displayList = displayList.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location_name?.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc") {
      displayList.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (sort === "price_desc") {
      displayList.sort((a, b) => b.price_per_unit - a.price_per_unit);
    } else if (sort === "freshness") {
      displayList.sort((a, b) => b.freshnessScore - a.freshnessScore);
    } else if (sort === "proximity") {
      displayList.sort((a, b) => a.distanceKm - b.distanceKm);
    }
  }

  return (
    <div className="space-y-4">
      {isOfflineMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex items-center gap-2 font-semibold">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Viewing offline marketplace cache. Search, filters, and add-to-cart are powered by local storage.</span>
        </div>
      )}

      {displayList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all group"
            >
              {/* Image & Freshness Tag */}
              <div className="relative">
                <img
                  src={getProduceImageUrl(item.category, item.image_url)}
                  alt={item.name}
                  className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${
                      item.freshness_tier === "Fresh" ? "bg-emerald-600 text-white" :
                      item.freshness_tier === "Good" ? "bg-blue-600 text-white" :
                      "bg-amber-600 text-white"
                    }`}
                  >
                    {item.freshness_tier}
                  </span>
                  <span className="bg-slate-900/80 backdrop-blur-[2px] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    Score: {item.finalScore}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {item.farmerRating}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 group-hover:text-primary transition-colors text-base line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    Farmer: <span className="font-semibold text-slate-700">{item.farmer?.full_name || "Ashanti Farmer"}</span>
                  </p>
                </div>

                {/* Location & Harvest Dates */}
                <div className="space-y-1 text-xs text-muted-foreground border-y py-2.5 my-2">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {item.location_name} ({item.distanceKm} km away)
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Harvested: {new Date(item.harvest_date).toLocaleDateString()}</span>
                  </p>
                </div>

                {/* Pricing and Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-primary leading-none">
                      {item.price_per_unit} GHS
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      per bag ({item.quantity_available} left)
                    </span>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/marketplace/${item.id}`}
                      className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted border border-slate-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <AddToCartButton
                      produceId={item.id}
                      price={parseFloat(item.price_per_unit as any)}
                      name={item.name}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl p-16 text-center space-y-4 shadow-sm">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/60 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-900">No produce listings found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We couldn't find any vegetable matches for your search filters. Try clearing some query parameters or expanding your search tags.
          </p>
        </div>
      )}
    </div>
  );
}
