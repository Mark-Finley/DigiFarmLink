import { createServerSideClient } from "@/utils/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddToCartButton from "@/components/AddToCartButton";
import { calculateDistance } from "@/utils/recommendation";
import { Sprout, Star, MapPin, Tag, Calendar, ShoppingBag, ArrowLeft, Phone, ShieldCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduceImageUrl } from "@/utils/images";

interface PageProps {
  params: Promise<{ id: string }>;
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

export default async function ProduceDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const supabase = await createServerSideClient();

  // 1. Fetch produce listing with farmer profile join
  const { data: item } = await supabase
    .from("produce")
    .select(`
      *,
      farmer:profiles!produce_farmer_id_fkey (
        id,
        full_name,
        phone_number,
        location_name,
        latitude,
        longitude
      )
    `)
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  // 2. Fetch farmer reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey (
        full_name
      )
    `)
    .eq("reviewed_user_id", item.farmer_id)
    .order("created_at", { ascending: false });

  // 3. Determine distance relative to default buyer location
  let user = null;
  let buyerLocation = "Kumasi Central";

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user?.user_metadata?.location_name) {
      buyerLocation = user.user_metadata.location_name;
    }
  } catch (error) {
    // Fail silently
  }

  const coords = coordinatesMap[buyerLocation] || coordinatesMap["Kumasi Central"];
  const distanceKm = Math.round(calculateDistance(coords.lat, coords.lon, item.latitude, item.longitude) * 10) / 10;

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 4.2;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Left image display */}
          <div className="relative rounded-xl overflow-hidden border bg-muted/20">
            <img
              src={getProduceImageUrl(item.category, item.image_url)}
              alt={item.name}
              className="w-full h-80 md:h-[420px] object-cover"
            />
            <span className={`absolute top-4 right-4 text-xs font-black uppercase px-3.5 py-1.5 rounded-full shadow-md ${
              item.freshness_tier === "Fresh" ? "bg-emerald-600 text-white" :
              item.freshness_tier === "Good" ? "bg-blue-600 text-white" :
              "bg-amber-600 text-white"
            }`}>
              Freshness: {item.freshness_tier}
            </span>
          </div>

          {/* Right text layout details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                  <Tag className="h-3.5 w-3.5" />
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {avgRating} ({reviews?.length || 0} reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.name}
              </h1>

              {/* Price block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Price per Unit</span>
                  <span className="text-2xl font-black text-primary">{item.price_per_unit} GHS</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">Stock Level</span>
                  <span className="text-lg font-bold text-slate-800">{item.quantity_available} bags left</span>
                </div>
              </div>

              {/* Corridor details */}
              <div className="space-y-2 text-sm text-muted-foreground pt-2">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Harvested at <span className="font-semibold text-slate-800">{item.location_name}</span> ({distanceKm} km from {buyerLocation})</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Harvest Date: <span className="font-semibold text-slate-800">{new Date(item.harvest_date).toLocaleDateString()}</span></span>
                </p>
              </div>
            </div>

            {/* Seller Contact & Action */}
            <div className="space-y-4 pt-4 border-t">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Farmer Profiles</h4>
                <p className="text-sm font-bold text-slate-800">{item.farmer?.full_name || "Ashanti vegetable farmer"}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  Contact: <span className="font-semibold text-slate-800">{item.farmer?.phone_number || "No contact info listed"}</span>
                </p>
              </div>

              <div className="flex gap-4">
                <AddToCartButton
                  produceId={item.id}
                  price={parseFloat(item.price_per_unit as any)}
                  name={item.name}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Farmer reviews history */}
        <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2 border-b pb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            Farmer Review Ledger ({reviews?.length || 0})
          </h3>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="space-y-2 border-b pb-5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{rev.reviewer?.full_name || "Buyer"}</span>
                    <span className="text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? "fill-current" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{rev.comment || "No comment left."}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <Star className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm">No reviews have been logged for this farmer yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
