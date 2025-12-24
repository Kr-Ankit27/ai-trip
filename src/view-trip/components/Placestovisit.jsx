import React from "react";
import { Map, Clock, Ticket, MapPin, Compass, Sparkles } from "lucide-react";
import PlaceImage from "./PlaceImage";
import { motion } from "framer-motion";

export default function Placestovisit({ trip }) {
  if (!trip) {
    return (
      <div className="py-10 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 font-medium">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Syncing your itinerary...
        </div>
      </div>
    );
  }

  const resolveItinerary = (t) => {
    if (!t || typeof t !== "object") return { arr: [] };
    const paths = [
      t?.tripData?.itinerary,
      t?.tripData?.travel_plan?.itinerary,
      t?.travel_plan?.itinerary,
      t?.itinerary,
      t?.data?.tripData?.itinerary,
      t?.doc?.tripData?.itinerary,
      t?.tripData?.data?.itinerary,
      t?.tripData?.itinerary_details,
    ];
    let found = paths.find((a) => Array.isArray(a) && a.length > 0);

    // If it's an object with day keys like { "day1": {...}, "day2": {...} }
    if (!found) {
      const potentialObj = t?.tripData?.itinerary || t?.tripData?.travel_plan?.itinerary;
      if (potentialObj && typeof potentialObj === 'object' && !Array.isArray(potentialObj)) {
        found = Object.values(potentialObj);
      }
    }

    if (!found) return { arr: [] };

    // --- SELF-HEALING: Flattening Check ---
    // If the items in the 'found' array look like ACTIVITIES (flat) instead of DAYS (nested),
    // we regroup them by their 'day' or 'dayNumber' field.
    const firstItem = found[0];
    const isFlat = firstItem && (firstItem.activity || firstItem.placeName || firstItem.name) && !Array.isArray(firstItem.plan || firstItem.activities || firstItem.itinerary);

    if (isFlat) {
      console.log("🛠️ Self-Healing: Regrouping flat itinerary activities into days...");
      const dayMap = {};
      found.forEach((item) => {
        const d = item.day || item.dayNumber || item.day_number || 1;
        if (!dayMap[d]) {
          dayMap[d] = { day: d, title: `Day ${d}`, plan: [] };
        }
        dayMap[d].plan.push(item);
      });
      found = Object.values(dayMap).sort((a, b) => a.day - b.day);
    }

    return { arr: found || [] };
  };

  const itinerary = resolveItinerary(trip).arr;

  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="py-10 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-center text-slate-400">
        <Compass className="w-10 h-10 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold">Planned paths empty</h3>
        <p className="text-sm">We couldn't load the day-by-day plan for this trip.</p>
      </div>
    );
  }

  const ticketTextFor = (p) => {
    let v = p?.ticket_pricing_approx || p?.ticket_price || p?.ticket_price_approx || p?.ticket_pricing;
    if (v == null) return "Free Entrance";

    // Handle object structure { min, max } or { price }
    if (typeof v === 'object') {
      const min = v.min !== undefined ? v.min : (v.min_price !== undefined ? v.min_price : v.price);
      const max = v.max !== undefined ? v.max : v.max_price;

      if (min !== undefined && max !== undefined) {
        if (Number(min) === 0 && Number(max) === 0) v = "Free Entrance";
        else v = `${min} - ${max}`;
      }
      else if (min !== undefined || max !== undefined) {
        const val = min !== undefined ? min : max;
        if (Number(val) === 0) v = "Free Entrance";
        else v = val;
      }
      else v = JSON.stringify(v);
    }

    const s = String(v).trim().toLowerCase();
    if (s === "0" || s.includes("free") || s.includes("no entry") || s === "{}" || s === "null" || s.includes("min\":0")) return "Free Entrance";
    return String(v);
  };

  const openMap = (name, addr) => {
    const q = encodeURIComponent([name || "", addr || ""].join(" "));
    window.open(`https://www.google.com/maps/search/${q}`, "_blank");
  };

  return (
    <section className="py-8 relative">
      <div className="flex items-center gap-3 mb-12">
        <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-500/30">
          <Compass className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">Daily Odyssey</h3>
          <p className="text-slate-400 font-medium">Your step-by-step exploration guide</p>
        </div>
      </div>

      <div className="space-y-16 relative px-4 sm:px-12 lg:px-20">
        {/* The Timeline Line (Desktop) - Precisely centered under the 100px badge (at 50px + parent offset) */}
        <div className="absolute left-[66px] sm:left-[98px] lg:left-[130px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 via-blue-500/30 to-transparent hidden lg:block" />

        {itinerary.map((dayObj, dayIndex) => {
          let dayNum = dayObj?.day ?? (dayIndex + 1);
          // Strip "Day" or "day" prefix if present
          if (typeof dayNum === 'string') {
            dayNum = dayNum.replace(/day\s*/i, '').trim();
          }
          const dayTitle = dayObj?.title || `Day ${dayNum}`;

          // Aggressive plan resolution
          let plan = [];
          if (Array.isArray(dayObj?.plan)) plan = dayObj.plan;
          else if (Array.isArray(dayObj?.activities)) plan = dayObj.activities;
          else if (Array.isArray(dayObj?.daily_plan)) plan = dayObj.daily_plan;
          else if (Array.isArray(dayObj?.schedule)) plan = dayObj.schedule;
          else if (Array.isArray(dayObj?.items)) plan = dayObj.items;
          else if (Array.isArray(dayObj?.itinerary)) plan = dayObj.itinerary;
          else if (Array.isArray(dayObj?.places)) plan = dayObj.places;
          else if (dayObj?.plan && typeof dayObj.plan === 'object') plan = Object.values(dayObj.plan);

          return (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="relative"
            >
              {/* Day Header with Dot */}
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0 min-w-[100px] border border-white/20">
                  <span className="text-white font-black text-xl leading-none">
                    {String(dayNum).toLowerCase().includes('day') ? dayNum : `Day ${dayNum}`}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white tracking-tight">{dayTitle}</h4>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    {plan.length} Key Stops Planned
                  </div>
                </div>
              </div>

              {/* Activities for the Day */}
              <div className="lg:ml-16 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {plan.map((p, idx) => {
                  const activity = p?.activity || p?.title || p?.placeName || p?.place_name || p?.name || p?.attraction || p?.location_name || p?.place || p?.locationName || p?.item || p?.itinerary_item || p?.activity_name || `Activity ${idx + 1}`;
                  const desc = p?.description || "";
                  const travelTime = p?.travel_time || "";
                  const timeLabel = p?.time_range || p?.time_of_day || "";
                  const address = p?.address || p?.location || "";
                  const ticketText = ticketTextFor(p);

                  return (
                    <div key={idx} className="relative group/card h-full">
                      {/* Sub-timeline Connector */}
                      {idx !== plan.length - 1 && (
                        <div className="absolute left-[34px] top-32 bottom-0 w-0.5 bg-white/5 hidden lg:block z-0" />
                      )}

                      <motion.article
                        whileHover={{ y: -5, scale: 1.01 }}
                        className="h-full bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-5 lg:p-6 flex flex-col shadow-2xl transition-all duration-500 hover:border-white/40 hover:bg-white/[0.08]"
                      >
                        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start text-center lg:text-left">
                          {/* Simplified Compact Imagery using first 2 words */}
                          <div className="flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden shadow-xl border border-white/10 relative group-hover/card:border-blue-500/50 transition-colors">
                            <PlaceImage
                              query={`${activity} ${address.split(',')[0]} landmark landmark`}
                              alt={activity}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                          </div>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                              {timeLabel && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/20 ring-1 ring-white/10">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[9px] font-black uppercase tracking-widest line-clamp-1 max-w-[100px]">
                                    {timeLabel}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-600/20 ring-1 ring-white/10">
                                <Ticket className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest line-clamp-1 max-w-[150px]">
                                  {ticketText}
                                </span>
                              </div>
                            </div>

                            <h5 className="text-lg font-bold text-white leading-tight mb-2 group-hover/card:text-blue-400 transition-all duration-300 line-clamp-1">
                              {activity}
                            </h5>

                            <p className="text-slate-300 text-xs leading-relaxed font-medium opacity-80 line-clamp-2">
                              {desc}
                            </p>
                          </div>
                        </div>

                        {/* Stable Action Bar pinned to bottom */}
                        <div className="mt-auto pt-6">
                          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-semibold max-w-full sm:max-w-[60%]">
                              <div className="p-1.5 bg-rose-500/20 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                              </div>
                              <span className="line-clamp-1">{address}</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              {travelTime && (
                                <div className="flex items-center gap-1.5 text-blue-400 text-[9px] font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20">
                                  <Compass className="w-3.5 h-3.5 animate-pulse" />
                                  <span className="line-clamp-1 max-w-[140px]">{travelTime}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => openMap(activity, address)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all active:scale-95 shadow-xl shadow-blue-600/20 ring-1 ring-white/10 whitespace-nowrap"
                              >
                                <Map className="w-3.5 h-3.5" />
                                Map
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
