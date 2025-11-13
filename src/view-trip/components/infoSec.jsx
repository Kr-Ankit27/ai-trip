// src/view-trip/components/infoSec.jsx
import React from "react";
import { FaCalendarAlt, FaUserFriends } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import PlaceImage from "./PlaceImage";
import WeatherWidget from "./WeatherWidget"; // ✅ since it's in the same folder

/**
 * InfoSec — destination overview with weather and details
 */
function InfoSec({ trip }) {
  const userSelection = trip?.userSelection || {};
  const tripData = trip?.tripData || {};

  const locationText =
    userSelection?.location || tripData?.location || "Beautiful Destination";

  // ✳️ short, clean query (one strong landmark/city image)
  const imageQuery = `${locationText} city landmark`;

  // Extract city for weather query (avoid long region strings)
  const makeCityQuery = (loc) => {
    if (!loc) return "";
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts[0] : loc;
  };

  const weatherLocation = makeCityQuery(locationText);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Cover Image */}
      <div className="w-full h-[320px] overflow-hidden rounded-t-2xl shadow-sm">
        <PlaceImage
          query={imageQuery}
          alt={locationText}
          className="w-full h-full"
          style={{ borderRadius: 0 }}
        />
      </div>

      <div className="p-5">
        <div className="md:flex md:items-start md:gap-6">
          {/* Left: Info Section */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              {userSelection?.location || tripData?.location || "Unknown Destination"}
            </h2>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {/* Duration */}
              <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <FaCalendarAlt className="text-red-500" />
                <span>{userSelection?.days || tripData?.duration || "N/A"} Days</span>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <GiMoneyStack className="text-yellow-500" />
                <span>
                  {userSelection?.budget || tripData?.budget_category || "Unknown"} Budget
                </span>
              </div>

              {/* Travelers */}
              <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <FaUserFriends className="text-blue-500" />
                <span>{userSelection?.travelers || "N/A"}</span>
              </div>
            </div>

            {tripData?.best_time_to_visit && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-1">Best Time to Visit:</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tripData.best_time_to_visit}
                </p>
              </div>
            )}
          </div>

          {/* Right: Weather Widget */}
          <div className="mt-6 md:mt-0 md:w-[320px]">
            <WeatherWidget
              location={weatherLocation}
              units="metric"
              cacheTTL={10 * 60 * 1000} // 10 min cache
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoSec;
