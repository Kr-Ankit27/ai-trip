// src/view-trip/components/Hotel.jsx
import React from "react";
import { FaMapMarkerAlt, FaStar, FaMoneyBillWave } from "react-icons/fa";
import PlaceImage from "./PlaceImage";

export default function Hotel({ trip, hotels }) {
  if (!trip && !hotels) {
    return (
      <div className="py-6">
        <h3 className="text-lg font-semibold mb-2">Hotel Recommendations</h3>
        <p className="text-sm text-gray-600">Loading hotel data...</p>
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
      <div className="py-6">
        <h3 className="text-lg font-semibold mb-2">Hotel Recommendations</h3>
        <p className="text-sm text-gray-600">No hotel recommendations available.</p>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h3 className="text-2xl font-semibold mb-4">Hotel Recommendations</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

          const priceText =
            minPrice && maxPrice
              ? `${minPrice} - ${maxPrice} per night`
              : minPrice || maxPrice || "Price not available";

          return (
            <article
              key={h?.id || idx}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col 
                         transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.01] hover:bg-gray-50"
            >
              <div className="h-40 w-full overflow-hidden bg-gray-100">
                <PlaceImage
                  query={`${name} ${address || ""}`}
                  alt={name}
                  className="w-full h-full"
                  style={{ borderRadius: 0 }}
                />
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">{name}</h4>

                {address && (
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-pink-500" />
                    <span className="truncate">{address}</span>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium flex items-center gap-2 text-gray-800">
                      <FaMoneyBillWave className="text-yellow-500" />
                      <span className="text-sm">{priceText}</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <FaStar className="text-amber-400" />
                      <span>{rating}</span>
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
                    className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md 
                               hover:bg-indigo-700 transition-colors duration-300"
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
