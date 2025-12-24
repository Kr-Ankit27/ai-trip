import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSec from "../components/infoSec";
import Hotel from "../components/Hotel";
import Placestovisit from "../components/Placestovisit";
import Footer from "../components/Footer";
import TravelAssistant from "../components/TravelAssistant";
import TripTabs from "../components/TripTabs";
import CultureHub from "../components/CultureHub";
import TripInsights from "../components/TripInsights";
import { motion, AnimatePresence } from "framer-motion";

function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [bgImage, setBgImage] = useState("");
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    if (tripId) {
      GetTripData();
    }
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      const loc = trip?.userSelection?.location || trip?.tripData?.location || "";
      if (loc) {
        import("../../lib/utils").then(({ fetchImageFor }) => {
          fetchImageFor(`${loc.split(',')[0]} travel destination cinematic 4k`).then(url => {
            if (url) setBgImage(url);
          });
        });
      }
    }
  }, [trip]);

  const GetTripData = async () => {
    try {
      const docRef = doc(db, "trips", tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        data.id = docSnap.id;
        setTrip(data);
      } else {
        setTrip(null);
      }
    } catch (err) {
      console.error("🔥 Error fetching trip data:", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900 relative"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-4 md:p-10 lg:px-20 xl:px-44 2xl:px-56 space-y-12 max-w-[1920px] mx-auto"
      >
        {/* Information Section */}
        {trip ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <InfoSec trip={trip} />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center p-20 text-white font-medium">
            <span className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-3"></span>
            Loading your dream trip...
          </div>
        )}

        {/* Navigation Tabs */}
        {trip && <TripTabs activeTab={activeTab} setActiveTab={setActiveTab} />}

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {trip && activeTab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <Hotel trip={trip} />
              <Placestovisit trip={trip} />
            </motion.div>
          )}

          {trip && activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CultureHub trip={trip} />
            </motion.div>
          )}

          {trip && activeTab === 'hub' && (
            <motion.div
              key="hub"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TripInsights trip={trip} />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer trip={trip} />

        {/* Floating AI Assistant */}
        <TravelAssistant trip={trip} />
      </motion.div>
    </div>
  );
}

export default Viewtrip;
