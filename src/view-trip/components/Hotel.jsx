import React from "react";
import { Star, DollarSign, MapPin, ExternalLink, BedDouble } from "lucide-react";
import PlaceImage from "./PlaceImage";
import { motion } from "framer-motion";

export default function Hotel({ trip, hotels }) {
  if (!trip && !hotels) {
    return (
      <div className="py-10 text-center text-slate-400">
        <h3 className="text-xl font-bold mb-4">Hotel Recommendations</h3>
        <div className="flex items-center justify-center gap-2 font-medium">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Finding the best stays...
        </div>
      </div>
    );
  }

  let list = [];

  if (Array.isArray(hotels)) {
    list = hotels;
  } else if (Array.isArray(trip?.tripData?.travel_plan?.hotel_options)) {
    list = trip.tripData.travel_plan.hotel_options;
  } else if (Array.isArray(trip?.tripData?.hotel_options)) {
    list = trip.tripData.hotel_options;
  } else if (Array.isArray(trip?.travel_plan?.hotel_options)) {
    list = trip.travel_plan.hotel_options;
  } else if (Array.isArray(trip?.hotel_options)) {
    list = trip.hotel_options;
  }

  if (!list || list.length === 0) {
    return (
      <div className="py-10 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-center text-slate-400">
        <BedDouble className="w-10 h-10 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold">No stays found</h3>
        <p className="text-sm">We couldn't find hotel recommendations for this trip.</p>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <BedDouble className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">Prime Stays</h3>
            <p className="text-slate-400 font-medium">Handpicked for your comfort</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {list.map((h, idx) => {
          const name = h?.name || h?.title || `Hotel ${idx + 1}`;
          const address = h?.address || h?.location || "";
          const description = h?.description || h?.summary || "";
          const rating = h?.rating || h?.stars || "N/A";
          const minPrice =
            h?.pricing_per_night_approx?.min ||
            h?.pricing_per_night_approx?.min_price ||
            "";
          const maxPrice =
            h?.pricing_per_night_approx?.max ||
            h?.pricing_per_night_approx?.max_price ||
            "";

          let priceText = "";
          if (minPrice && maxPrice) {
            priceText = `${minPrice} - ${maxPrice}`;
          } else if (minPrice || maxPrice) {
            priceText = minPrice || maxPrice;
          } else if (typeof h?.pricing_per_night_approx === 'string' && h.pricing_per_night_approx.trim() !== "") {
            priceText = h.pricing_per_night_approx;
          } else if (h?.price_per_night) {
            priceText = String(h.price_per_night);
          } else if (h?.price) {
            if (typeof h.price === 'object') priceText = `${h.price?.min || ''} ${h.price?.max || ''}`.trim();
            else priceText = String(h.price);
          }

          if (!priceText || priceText.trim() === "" || priceText === "undefined") {
            priceText = "Quote on site";
          }

          // Technical Audit: log if mapping fails
          if (priceText === "Quote on site") {
            console.warn("💎 Price Registry Failure:", { hotel: name, data: h });
          }

          return (
            <motion.article
              key={h?.id || idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden flex flex-col 
                         transition-all duration-500 hover:border-white/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Hotel Image Wrapper */}
              <div className="h-56 w-full overflow-hidden relative">
                <PlaceImage
                  query={`${name} ${address.split(',')[0]} hotel exterior`}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-black">{rating}</span>
                </div>
              </div>

              {/* Hotel Details */}
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">{name}</h4>

                {address && (
                  <div className="text-slate-400 text-xs mb-4 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{address}</span>
                  </div>
                )}

                <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3 font-medium opacity-80">{description}</p>

                {/* Footer Actions */}
                <div className="mt-auto grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
                      <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-0.5">Est. Nightly Rate</p>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xl font-black tracking-tight">{priceText}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/${encodeURIComponent(
                          name + " " + address
                        )}`,
                        "_blank"
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl 
                               transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                  >
                    Explore Location
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
