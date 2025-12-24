// src/my-trips/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  Navigation,
  Sparkles,
  Trash2,
  Trash
} from "lucide-react";
import { db } from "../service/firebaseConfig";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { fetchImageFor, DEFAULT_IMAGE } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userState, setUserState] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem("userInfo") ?? localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse stored user JSON:", err);
      return { __parseError: true };
    }
  };

  useEffect(() => {
    const stored = readStoredUser();
    setUserState(stored);
    if (stored && !stored.__parseError && stored.email) {
      fetchTripsForUser(stored.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTripsForUser = async (userEmail) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "trips"),
        where("userEmail", "==", userEmail),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTrips(docs);
      resolveTripImages(docs);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips. Please try again.");
      setTrips([]);
      setLoading(false);
    }
  };

  const resolveTripImages = async (tripsArray) => {
    if (!Array.isArray(tripsArray) || tripsArray.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const mapped = await Promise.all(
        tripsArray.map(async (t) => {
          const td = t.tripData || {};
          const fsImage = td.hotel_options?.[0]?.image_url || null;
          if (fsImage) return { ...t, resolvedImage: fsImage };
          const searchTerm = td.location ? `${td.location.split(',')[0]} landmark` : "travel landscape";
          const pix = await fetchImageFor(searchTerm);
          return { ...t, resolvedImage: pix || DEFAULT_IMAGE };
        })
      );
      setTrips(mapped);
    } catch (err) {
      console.error("resolveTripImages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip memory?")) return;
    setDeletingId(tripId);
    try {
      await deleteDoc(doc(db, "trips", tripId));
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success("Trip vanished into the void.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete trip.");
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllTrips = async () => {
    if (!userState?.email) return;
    if (!window.confirm("CRITICAL: This will permanently delete ALL your saved trips. Proceed?")) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "trips"),
        where("userEmail", "==", userState.email)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      setTrips([]);
      toast.success("Your travel log has been cleared.");
    } catch (err) {
      console.error(err);
      toast.error("Mass deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 lg:px-12">
        {/* Header Section */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">Personalized Collection</span>
            </div>

            {trips.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deleteAllTrips}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all font-bold"
              >
                <Trash size={14} />
                Clear All memories
              </motion.button>
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black tracking-tight"
          >
            My <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Expeditions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-400 text-lg max-w-2xl font-medium"
          >
            Your curated travel log of AI-generated adventures and future explorations.
          </motion.p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[400px] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 text-center">
            <p className="text-rose-400 font-bold mb-4">{error}</p>
            <button
              onClick={() => fetchTripsForUser(userState?.email)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold"
            >
              Retry Connection
            </button>
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 text-center border-dashed border-white/20"
          >
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-8">
              <Navigation className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-3xl font-black mb-4">No trips discovered yet</h3>
            <p className="text-slate-400 text-lg mb-10 max-w-md font-medium">
              Start your journey today. Let AI help you plan the perfect escape.
            </p>
            <button
              onClick={() => navigate("/create-trip")}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl text-lg font-black tracking-tight transition-all active:scale-95 shadow-2xl shadow-blue-600/20"
            >
              Architect Your First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {trips.map((trip, idx) => {
                const data = trip.tripData?.travel_plan || trip.tripData || {};
                const loc = data.location || trip.userSelection?.location || "Global";
                const city = loc.split(',')[0];
                const country = loc.split(',').pop()?.trim() || "Earth";
                const days = data.duration || trip.userSelection?.noOfDays || "N/A";
                const budget = data.budget_category || trip.userSelection?.budget || "Standard";
                const travelers = trip.userSelection?.travelers || "Solo";

                return (
                  <motion.article
                    key={trip.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/view-trip/${trip.id}`)}
                    className="group cursor-pointer bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col 
                               transition-all duration-500 hover:border-white/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10"
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img
                        src={trip.resolvedImage || DEFAULT_IMAGE}
                        alt={city}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                      {/* Floating Info Overlay */}
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{days} Days</span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrip(trip.id);
                          }}
                          className="p-2.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/10 text-rose-400 hover:text-rose-300 transition-all"
                        >
                          {deletingId === trip.id ? (
                            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {country}
                      </div>

                      <h2 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                        {city}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-auto pt-6 border-t border-white/10">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">
                            {budget}
                          </span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black text-amber-400 uppercase tracking-tight">
                            {travelers}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Action Bar Background Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-20" />
    </div>
  );
}
