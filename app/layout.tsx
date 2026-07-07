import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ToastContainer";
import OfflineSyncManager from "@/components/OfflineSyncManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DigiFarmLink Ghana | Connecting Farmers, Buyers, and Transporters",
  description:
    "A direct-to-consumer agricultural marketplace connecting smallholder vegetable farmers in Kumasi/Ashanti region with wholesale buyers and logistics providers.",
  keywords: ["Ghana Agriculture", "DigiFarmLink", "Ashanti Region Farmers", "Vegetable Marketplace", "Kumasi Logistics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <ToastContainer />
        <OfflineSyncManager />
      </body>
    </html>
  );
}
