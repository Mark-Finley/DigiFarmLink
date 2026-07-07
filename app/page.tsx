import Link from "next/link";
import { Sprout, ShoppingBag, Truck, CheckCircle, ArrowRight, ShieldCheck, Map, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingFaqs from "@/components/LandingFaqs";
import { createServerSideClient } from "@/utils/supabase";

export const revalidate = 60; // Revalidate home page statistics every 60 seconds

export default async function Home() {
  let stats = {
    produceCount: 100,
    farmerCount: 20,
    orderCount: 30,
    transporterCount: 8,
  };

  try {
    const supabase = await createServerSideClient();
    
    // Fetch statistics dynamically from Supabase in parallel
    const [pCount, fCount, oCount, tCount] = await Promise.all([
      supabase.from("produce").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "farmer"),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "transporter"),
    ]);

    stats = {
      produceCount: pCount.count ?? 100,
      farmerCount: fCount.count ?? 20,
      orderCount: oCount.count ?? 30,
      transporterCount: tCount.count ?? 8,
    };
  } catch (error) {
    // Fail silently, fallback to seed defaults
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/50 via-white to-white py-20 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.green.50),white)] opacity-70" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Ashanti Region Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-bounce">
              <span>Ashanti Region Supply Corridor</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Bridging the Gap Between <br />
              <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                Ghanaian Farmers & Wholesale Buyers
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DigiFarmLink Ghana streamlines the agricultural supply chain by enabling vegetable growers in Kumasi and surrounding Ashanti municipalities to sell directly to retailers and secure logistics providers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/20 transition-all text-base border border-primary"
              >
                <span>Join the Corridor Network</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/marketplace"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-slate-800 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all text-base border border-slate-200 shadow-sm"
              >
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span>Browse Produce Listings</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Statistics Grid */}
      <section id="stats" className="border-y bg-muted/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-xl border text-center space-y-2 hover:shadow-md transition-shadow">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stats.produceCount}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Available Listings</p>
            </div>
            <div className="bg-card p-6 rounded-xl border text-center space-y-2 hover:shadow-md transition-shadow">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stats.farmerCount}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Farmers</p>
            </div>
            <div className="bg-card p-6 rounded-xl border text-center space-y-2 hover:shadow-md transition-shadow">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stats.orderCount}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
            </div>
            <div className="bg-card p-6 rounded-xl border text-center space-y-2 hover:shadow-md transition-shadow">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stats.transporterCount}</p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Logistics Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific Portal Entrances */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Tailored Agricultural Portals</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your custom dashboard workspace and access specialized workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Farmer Card */}
          <div className="border bg-card p-8 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:border-primary/30 transition-all group">
            <div>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Sprout className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">For Farmers</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Upload crop listings (tomatoes, peppers, onions), set bags available, declare freshness scores, and receive wholesale offers. Utilizes offline sync capability.
              </p>
            </div>
            <Link
              href="/register?role=farmer"
              className="inline-flex items-center text-sm font-bold text-primary hover:underline group/link gap-1"
            >
              <span>Join as Farmer</span>
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Buyer Card */}
          <div className="border bg-card p-8 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:border-accent/30 transition-all group">
            <div>
              <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">For Wholesale Buyers</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Browse nearby listings sorted by our Smart Recommendation engine (price + distance + freshness). Put multiple orders in your cart and complete checkout.
              </p>
            </div>
            <Link
              href="/register?role=buyer"
              className="inline-flex items-center text-sm font-bold text-accent hover:underline group/link gap-1"
            >
              <span>Join as Buyer</span>
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Transporter Card */}
          <div className="border bg-card p-8 rounded-2xl flex flex-col justify-between hover:shadow-xl hover:border-green-600/30 transition-all group">
            <div>
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-green-700 group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">For Transporters</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Receive instant delivery requests once farmers accept buyer orders. Plan fuel routes using interactive Leaflet town mapping, transport crops, and get paid.
              </p>
            </div>
            <Link
              href="/register?role=transporter"
              className="inline-flex items-center text-sm font-bold text-green-600 hover:underline group/link gap-1"
            >
              <span>Join as Transporter</span>
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-slate-50 border-y py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">The Ashanti Agricultural Pipeline</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              How DigiFarmLink Ghana streamlines logistics and transactions end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto lg:mx-0">
                1
              </div>
              <h4 className="font-bold text-lg text-slate-900">Farmers List Crop Batches</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Farmers upload tomato or pepper bags on-the-go. If they have poor signal in their fields, listings sync immediately when they approach town.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto lg:mx-0">
                2
              </div>
              <h4 className="font-bold text-lg text-slate-900">Buyers Order and Checkout</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Retail buyers view a ranked feed. Our recommendation math matches them with the closest and freshest produce batches, allowing immediate checkout.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center mx-auto lg:mx-0">
                3
              </div>
              <h4 className="font-bold text-lg text-slate-900">Logistics Automatically Notified</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When a farmer accepts, drivers receive delivery notifications with map coordinates. They accept, complete transport, and deliver the cargo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got questions about our agricultural coordination system? We have answers.
            </p>
          </div>
          
          {/* Interactive FAQs Accordion */}
          <LandingFaqs />
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="bg-primary py-16 sm:py-20 text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,theme(colors.green.600),theme(colors.green.900))] opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Streamline Your Vegetable Supply Chain?
          </h2>
          <p className="text-base sm:text-lg text-green-100 max-w-xl mx-auto leading-relaxed">
            Create an account in seconds, choose your role, and connect with the rest of the Ashanti Region agricultural corridor today.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-accent text-accent-foreground font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 hover:shadow-xl hover:shadow-yellow-500/20 transition-all text-base border border-accent"
            >
              <span>Get Registered Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Footer */}
      <Footer />
    </div>
  );
}
