import { createServerSideClient } from "@/utils/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarketplaceControls from "@/components/MarketplaceControls";
import MarketplaceFeed from "@/components/MarketplaceFeed";
import { rankProduceListings, RankedProduce } from "@/utils/recommendation";
import { MapPin } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const coordinatesMap: Record<string, { lat: number; lon: number }> = {
  "Kumasi Central": { lat: 6.696, lon: -1.624 },
  Mampong: { lat: 7.062, lon: -1.403 },
  Obuasi: { lat: 6.206, lon: -1.669 },
  Ejura: { lat: 7.378, lon: -1.374 },
  Konongo: { lat: 6.616, lon: -1.214 },
  Bekwai: { lat: 6.452, lon: -1.585 },
  Offinso: { lat: 6.890, lon: -1.650 },
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const location = searchParams.location || "";
  const sort = searchParams.sort || "recommended";

  const supabase = await createServerSideClient();

  // 1. Resolve logged-in session for default location
  let user = null;
  let buyerLocation = "Kumasi Central";

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user?.user_metadata?.location_name) {
      buyerLocation = user.user_metadata.location_name;
    }
  } catch (error) {
    // Fail silently, anonymous user fallback is Kumasi Central
  }

  // Override location if passed in query param
  if (location && coordinatesMap[location]) {
    buyerLocation = location;
  }

  const coords = coordinatesMap[buyerLocation] || coordinatesMap["Kumasi Central"];

  // 2. Fetch produce listings and reviews
  // Using profiles join mapping directly to fetch farmer details
  const { data: rawListings } = await supabase
    .from("produce")
    .select(`
      *,
      farmer:profiles!produce_farmer_id_fkey (
        full_name,
        phone_number
      )
    `)
    .gt("quantity_available", 0);

  const { data: rawReviews } = await supabase
    .from("reviews")
    .select("reviewed_user_id, rating");

  let rankedProduce: RankedProduce[] = [];

  if (rawListings && rawListings.length > 0) {
    // Run Smart Recommendation algorithm
    const reviewsList = rawReviews || [];
    rankedProduce = rankProduceListings(rawListings, reviewsList, coords.lat, coords.lon);
  }

  // 3. Filter listings based on category and search query
  let filteredProduce = rankedProduce;

  if (category) {
    filteredProduce = filteredProduce.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filteredProduce = filteredProduce.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.farmer?.full_name?.toLowerCase().includes(q) ||
        item.location_name?.toLowerCase().includes(q)
    );
  }

  // 4. Sort listings based on selection
  if (sort === "price_asc") {
    filteredProduce.sort((a, b) => a.price_per_unit - b.price_per_unit);
  } else if (sort === "price_desc") {
    filteredProduce.sort((a, b) => b.price_per_unit - a.price_per_unit);
  } else if (sort === "freshness") {
    filteredProduce.sort((a, b) => b.freshnessScore - a.freshnessScore);
  } else if (sort === "proximity") {
    filteredProduce.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  // (recommended sorting is already completed by the ranking library default)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-green-50/40 to-transparent pt-12 pb-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ashanti Agricultural Marketplace
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-2xl">
              Browse fresh vegetable listings from Ashanti farmers. Proximity distances and recommendations are calculated relative to your selected hub.
            </p>
          </div>
          
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-bold">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Reference Hub: {buyerLocation}</span>
          </div>
        </div>
      </section>

      {/* Control panel & Listings feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Responsive filters component */}
        <MarketplaceControls
          currentSearch={search}
          currentCategory={category}
          currentLocation={buyerLocation}
          currentSort={sort}
        />

        <MarketplaceFeed
          initialProduce={filteredProduce}
          search={search}
          category={category}
          location={location}
          sort={sort}
          buyerLocation={buyerLocation}
        />
      </main>

      <Footer />
    </div>
  );
}
