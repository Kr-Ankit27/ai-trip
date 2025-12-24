import React from "react";
import { Calendar, Users, Wallet, MapPin, Sparkles, Navigation } from "lucide-react";
import PlaceImage from "./PlaceImage";
import { motion } from "framer-motion";

function InfoSec({ trip }) {
  const userSelection = trip?.userSelection || {};
  const tripData = trip?.tripData || {};

  const locationText =
    userSelection?.location || tripData?.location || "Beautiful Destination";

  const imageQuery = `${locationText.split(',')[0]} iconic landmark skyline 4k`;

  const makeCityQuery = (loc) => {
    if (!loc) return "";
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts[0] : loc;
  };

  const weatherLocation = makeCityQuery(locationText);

  return (
    <div className="relative group overflow-hidden">
      {/* Cinematic Hero Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-500 hover:border-white/40 group">

        {/* Left: Interactive Image Area */}
        <div className="w-full lg:w-[45%] h-[350px] lg:h-auto overflow-hidden relative">
          <PlaceImage
            query={imageQuery}
            alt={locationText}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/80 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              AI Generated Trip
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
              <Navigation className="w-3.5 h-3.5" />
              {weatherLocation}
            </div>
          </div>
        </div>

        {/* Right: Rich Content Area */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest mb-3">
              <MapPin className="w-4 h-4" />
              Destinations Hub
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              {locationText.split(',')[0]}
              <span className="block text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent mt-1">
                {locationText.split(',').slice(1).join(',')}
              </span>
            </h2>

            {/* Premium Stat Chips */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 px-5 py-3 rounded-2xl group/chip">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                  <p className="text-white font-bold">{userSelection?.days || tripData?.duration || "N/A"} Days</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 px-5 py-3 rounded-2xl group/chip">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget</p>
                  <p className="text-white font-bold">{userSelection?.budget || tripData?.budget_category || "Standard"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 px-5 py-3 rounded-2xl group/chip">
                <Users className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</p>
                  <p className="text-white font-bold">{userSelection?.travelers || "Solo Explorer"}</p>
                </div>
              </div>
            </div>

            {/* Data resolution for Best Time */}
            {(tripData?.best_time_to_visit || tripData?.travel_plan?.best_time_to_visit || trip?.tripData?.best_time || trip?.userSelection?.best_time) && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-tighter mb-1">Best time to visit</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {tripData?.best_time_to_visit || tripData?.travel_plan?.best_time_to_visit || trip?.tripData?.best_time || trip?.userSelection?.best_time}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default InfoSec;
