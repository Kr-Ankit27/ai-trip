// src/view-trip/components/Placestovisit.jsx
import React from "react";
import { FaMapMarkerAlt, FaRegClock, FaTicketAlt } from "react-icons/fa";
import PlaceImage from "./PlaceImage";

export default function Placestovisit({ trip }) {
  if (!trip) {
    return (
      <div className="py-6">
        <h3 className="text-lg font-semibold mb-2">Places to Visit</h3>
        <p className="text-sm text-gray-600">Loading itinerary…</p>
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
    ];
    const found = paths.find((a) => Array.isArray(a) && a.length > 0);
    return { arr: found || [] };
  };

  const itinerary = resolveItinerary(trip).arr;
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="py-6">
        <h3 className="text-lg font-semibold mb-2">Places to Visit</h3>
        <p className="text-sm text-gray-600">No itinerary available.</p>
      </div>
    );
  }

  const ticketTextFor = (p) => {
    const v =
      p?.ticket_pricing_approx ||
      p?.ticket_price ||
      p?.ticket_price_approx ||
      p?.ticket_pricing;
    if (v == null) return "Free";
    const s = String(v).trim().toLowerCase();
    if (s === "0" || s.includes("free") || s.includes("no entry")) return "Free";
    return String(v);
  };

  const openMap = (name, addr) => {
    const q = encodeURIComponent([name || "", addr || ""].join(" "));
    window.open(`https://www.google.com/maps/search/${q}`, "_blank");
  };

  return (
    <section className="py-6">
      <h3 className="text-2xl font-semibold mb-6">Places to Visit</h3>

      <div className="space-y-10">
        {itinerary.map((dayObj, dayIndex) => {
          const dayNum = dayObj?.day ?? dayIndex + 1;
          const dayTitle = dayObj?.title || `Day ${dayNum}`;
          const plan = Array.isArray(dayObj?.plan) ? dayObj.plan : [];

          return (
            <div key={dayIndex} className="rounded-lg border-b border-gray-100 pb-10">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-orange-600 mb-1">{`Day ${dayNum}`}</h4>
                <h5 className="text-xl font-semibold text-gray-800">{dayTitle}</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {plan.map((p, idx) => {
                  const activity = p?.activity || p?.title || `Activity ${idx + 1}`;
                  const desc = p?.description || "";
                  const travelTime = p?.travel_time || "";
                  const timeLabel = p?.time_range || p?.time_of_day || "";
                  const address = p?.address || p?.location || "";
                  const ticketText = ticketTextFor(p);

                  return (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col shadow-sm 
                                 hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1
                                 h-full min-h-[230px] justify-between"
                    >
                      <div className="flex gap-5 flex-1">
                        <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center overflow-hidden bg-gray-100 rounded-xl self-center">
                          <PlaceImage
                            query={`${activity} ${address || ""}`}
                            alt={activity}
                            className="w-full h-full"
                            style={{ borderRadius: 8 }}
                          />
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 justify-center">
                          <div className="flex items-start justify-between gap-3">
                            <h5 className="text-base font-semibold text-gray-900 truncate">
                              {activity}
                            </h5>

                            {timeLabel && (
                              <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                                {timeLabel}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-3">{desc}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-4 flex-wrap">
                          {travelTime && (
                            <div className="flex items-center gap-2">
                              <FaRegClock className="text-gray-400" />
                              <span>{travelTime}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <FaTicketAlt className="text-gray-500" />
                            {ticketText === "Free" ? (
                              <span className="text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                Free
                              </span>
                            ) : (
                              <span className="font-medium text-gray-700">{ticketText}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openMap(activity, address)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-sm rounded-md
                                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                        >
                          <FaMapMarkerAlt className="text-orange-600" />
                          <span className="text-orange-600 font-medium">Map</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
