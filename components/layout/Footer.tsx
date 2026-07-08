import Link from "next/link";
import { Sprout, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card text-muted-foreground transition-colors duration-300">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <Sprout className="h-6 w-6" />
              <span className="font-extrabold text-xl tracking-tight">DigiFarmLink Ghana</span>
            </div>
            <p className="text-sm">
              Empowering local smallholder vegetable farmers in the Ashanti Region by linking them directly with wholesale buyers and secure logistics.
            </p>
            <div className="inline-flex items-center space-x-2 bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span>Ashanti Corridor Corridor MVP</span>
            </div>
          </div>

          {/* Role Hubs */}
          <div className="space-y-3">
            <h4 className="text-foreground font-bold text-sm tracking-wider uppercase">Platform Hubs</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?role=farmer" className="hover:text-primary transition-colors">
                  Farmer Portal
                </Link>
              </li>
              <li>
                <Link href="/register?role=buyer" className="hover:text-primary transition-colors">
                  Buyer Marketplace
                </Link>
              </li>
              <li>
                <Link href="/register?role=transporter" className="hover:text-primary transition-colors">
                  Logistics Network
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Administrative Sign-in
                </Link>
              </li>
            </ul>
          </div>

          {/* Region Towns */}
          <div className="space-y-3">
            <h4 className="text-foreground font-bold text-sm tracking-wider uppercase">Municipal Hubs</h4>
            <ul className="space-y-2 text-sm grid grid-cols-2 gap-x-2">
              <li className="hover:text-primary cursor-pointer">Kumasi</li>
              <li className="hover:text-primary cursor-pointer">Mampong</li>
              <li className="hover:text-primary cursor-pointer">Obuasi</li>
              <li className="hover:text-primary cursor-pointer">Ejura</li>
              <li className="hover:text-primary cursor-pointer">Konongo</li>
              <li className="hover:text-primary cursor-pointer">Bekwai</li>
              <li className="hover:text-primary cursor-pointer">Offinso</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-foreground font-bold text-sm tracking-wider uppercase">Ashanti Office</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Central Market, Kumasi, Ghana</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+233 (0) 24 123 4567</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@digifarmlinkghana.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="border-t bg-muted/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Developed for the Ashanti Agritech Initiative.</p>
          <div className="flex space-x-6">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Ashanti Region Map</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
