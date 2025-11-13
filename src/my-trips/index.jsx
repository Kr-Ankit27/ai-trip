// src/my-trips/index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { db } from "../service/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { fetchImageFor, DEFAULT_IMAGE } from "../lib/utils";

export default function MyTrips() {
  const [trips, setTrips] = useState([]); // array of trip docs (may include resolvedImage)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userState, setUserState] = useState(null); // parsed user or null
  const navigate = useNavigate();

  // Read user from localStorage (tries both keys)
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

    if (!stored || stored.__parseError || !stored.email) {
      setLoading(false);
      if (stored && stored.__parseError) setError("Stored user data is corrupted. Please sign in again.");
      return;
    }

    const userEmail = stored.email;
    fetchTripsForUser(userEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for cross-tab or app-driven user changes
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userInfo" || e.key === "user") {
        const updated = readStoredUser();
        setUserState(updated);
        if (updated && !updated.__parseError && updated.email) fetchTripsForUser(updated.email);
        else setTrips([]);
      }
    };
    const onUserChanged = () => {
      const updated = readStoredUser();
      setUserState(updated);
      if (updated && !updated.__parseError && updated.email) fetchTripsForUser(updated.email);
      else setTrips([]);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("userChanged", onUserChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userChanged", onUserChanged);
    };
  }, []);

  // Fetch trips docs from Firestore
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
      setTrips(docs); // show list quickly (without images yet)
      // now resolve images for each trip (adds resolvedImage)
      resolveTripImages(docs);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips. Check console (index may be required).");
      setTrips([]);
      setLoading(false);
    }
  };

  // Resolve images: prefer Firestore image, otherwise fetch from Pixabay via fetchImageFor()
  const resolveTripImages = async (tripsArray) => {
    if (!Array.isArray(tripsArray) || tripsArray.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const mapped = await Promise.all(
        tripsArray.map(async (t) => {
          const td = t.tripData || {};
          const fsImage = Array.isArray(td.hotel_options) && td.hotel_options[0]?.image_url
            ? td.hotel_options[0].image_url
            : null;

          if (fsImage) {
            return { ...t, resolvedImage: fsImage };
          }

          // Build a helpful search query for Pixabay
          const searchTerm =
            (td.location && `${td.location} city landmark`) ||
            (td.title && `${td.title} landscape`) ||
            (t.title && `${t.title} travel`) ||
            "travel landscape";

          try {
            const pix = await fetchImageFor(searchTerm);
            return { ...t, resolvedImage: pix || DEFAULT_IMAGE };
          } catch (err) {
            console.warn("Pixabay fetch failed for", searchTerm, err);
            return { ...t, resolvedImage: DEFAULT_IMAGE };
          }
        })
      );

      setTrips(mapped);
    } catch (err) {
      console.error("resolveTripImages error:", err);
    } finally {
      setLoading(false);
    }
  };

  // small UI helpers
  const getTitle = (trip) => trip.tripData?.location ?? trip.tripData?.title ?? "Unnamed Trip";
  const getSubtitle = (trip) =>
    `${trip.tripData?.duration ?? ""}${trip.tripData?.budget_category ? " • " + trip.tripData.budget_category : ""}`;

  return (
    <section className="p-6 sm:px-10 lg:px-16">
      <h1 className="text-3xl font-extrabold mb-6">My Trips</h1>

      {loading && <p className="text-gray-500">Loading trips...</p>}

      {!loading && error && (
        <div className="mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && !userState && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You are not signed in.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/create-trip")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Create Trip / Sign In
            </button>
            <button onClick={() => navigate("/")} className="px-4 py-2 border rounded-md">
              Go Home
            </button>
          </div>
        </div>
      )}

      {!loading && !error && userState && userState.__parseError && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Saved user data is corrupted. Please sign in again.</p>
          <button
            onClick={() => {
              localStorage.removeItem("userInfo");
              localStorage.removeItem("user");
              window.dispatchEvent(new Event("userChanged"));
              navigate("/create-trip");
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Sign In
          </button>
        </div>
      )}

      {!loading && !error && userState && !userState.__parseError && trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No saved trips yet.</p>
          <button onClick={() => navigate("/create-trip")} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Create Your First Trip
          </button>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const imgSrc = trip.resolvedImage || trip.tripData?.hotel_options?.[0]?.image_url || DEFAULT_IMAGE;
            const title = getTitle(trip);
            const subtitle = getSubtitle(trip);

            return (
              <article
                key={trip.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-full h-40 sm:h-44 lg:h-44 overflow-hidden rounded-t-2xl bg-gray-50">
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover block"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>

                <div className="p-4 sm:p-5">
                  <h2 className="text-lg font-bold leading-5 mb-1">{title}</h2>
                  <p className="text-sm text-gray-500">{subtitle}</p>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="text-gray-500">{trip.tripData?.location?.split?.(",")?.[0] ?? ""}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span className="text-gray-500">{trip.tripData?.hotel_options?.[0]?.rating ?? "—"}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* bottom thin accent line */}
      <div className="fixed left-0 right-0 bottom-0 pointer-events-none">
        <div className="mx-auto max-w-5xl">
          <div className="h-0.5 bg-pink-500 w-full opacity-80" />
        </div>
      </div>
    </section>
  );
}
