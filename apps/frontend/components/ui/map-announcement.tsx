"use client";

import HeroBadge from "@/components/ui/hero-badge";
import { Icons } from "@/components/ui/icons";
import { MapPin, Navigation, Globe } from "lucide-react";

export function MapAnnouncement() {
  return (
    <div className="flex min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            🗺️ New Interactive Map Feature
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover and report community issues with our new interactive map. 
            Find issues near you, filter by category, and track their status in real-time.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <HeroBadge
            href="/map"
            text="Explore Map"
            icon={<MapPin className="h-4 w-4" />}
            endIcon={<Icons.chevronRight className="h-4 w-4" />}
            variant="default"
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          />
          
          <HeroBadge
            href="/report"
            text="Report Issue"
            icon={<Navigation className="h-4 w-4" />}
            variant="outline"
            size="lg"
            className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
          />
          
          <HeroBadge
            href="/my-issues"
            text="My Reports"
            icon={<Globe className="h-4 w-4" />}
            variant="ghost"
            size="lg"
            className="text-gray-300 hover:text-white"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">
            Real-time Updates
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">
            GPS Location
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
            Smart Filtering
          </span>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full border border-yellow-500/30">
            Mobile Friendly
          </span>
        </div>
      </div>
    </div>
  );
}

export function MapAnnouncementCompact() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-4">
      <div className="flex items-center justify-center">
        <HeroBadge
          href="/map"
          text="🗺️ New Interactive Map - Explore Community Issues"
          icon={<MapPin className="h-4 w-4" />}
          endIcon={<Icons.chevronRight className="h-4 w-4" />}
          variant="default"
          size="md"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
        />
      </div>
    </div>
  );
}

export function MapAnnouncementBanner() {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <HeroBadge
        href="/map"
        text="🗺️ New Map Feature Available!"
        icon={<MapPin className="h-4 w-4" />}
        endIcon={<Icons.chevronRight className="h-4 w-4" />}
        variant="default"
        size="md"
        className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-lg"
      />
    </div>
  );
} 