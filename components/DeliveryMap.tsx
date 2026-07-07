"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryMapProps {
  pickupLat: number;
  pickupLon: number;
  deliveryLat: number;
  deliveryLon: number;
  pickupAddress: string;
  deliveryAddress: string;
}

export default function DeliveryMap({
  pickupLat,
  pickupLon,
  deliveryLat,
  deliveryLon,
  pickupAddress,
  deliveryAddress,
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapInstance.current) return;

    // 1. Initialize map centered in Ashanti region
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([6.7, -1.5], 9);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMapInstance.current = map;

    // 2. Create custom divIcons for pickup (green) and delivery (blue)
    const pickupIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-75"></span>
          <div class="relative h-4 w-4 rounded-full bg-emerald-600 border-2 border-white shadow-md"></div>
        </div>
      `,
      className: "custom-leaflet-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const deliveryIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-sky-400 opacity-75"></span>
          <div class="relative h-4 w-4 rounded-full bg-sky-600 border-2 border-white shadow-md"></div>
        </div>
      `,
      className: "custom-leaflet-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // 3. Place Markers
    const markerPickup = L.marker([pickupLat, pickupLon], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<strong>📍 Pickup Point:</strong><br>${pickupAddress}`)
      .openPopup();

    const markerDelivery = L.marker([deliveryLat, deliveryLon], { icon: deliveryIcon })
      .addTo(map)
      .bindPopup(`<strong>🏁 Delivery Point:</strong><br>${deliveryAddress}`);

    // 4. Draw Polyline route between them
    const points: L.LatLngExpression[] = [
      [pickupLat, pickupLon],
      [deliveryLat, deliveryLon],
    ];

    const routeLine = L.polyline(points, {
      color: "#10b981",
      weight: 4,
      opacity: 0.8,
      dashArray: "8, 8",
    }).addTo(map);

    // Fit map bounds to show both locations
    const group = L.featureGroup([markerPickup, markerDelivery, routeLine]);
    map.fitBounds(group.getBounds().pad(0.15));

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [pickupLat, pickupLon, deliveryLat, deliveryLon, pickupAddress, deliveryAddress]);

  return (
    <div className="relative rounded-2xl overflow-hidden border shadow-inner bg-slate-100">
      <div ref={mapRef} className="w-full h-80 md:h-[450px] z-0" />
      
      {/* Route Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-[2px] border px-4 py-3 rounded-xl shadow-md z-[1000] text-xs space-y-1.5 font-semibold text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-600 border border-white" />
          <span>Pickup ({pickupAddress})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-600 border border-white" />
          <span>Delivery ({deliveryAddress})</span>
        </div>
      </div>
    </div>
  );
}
