// src/view-trip/[tripId]/index.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSec from "../components/infoSec";
import Hotel from "../components/Hotel";
import Placestovisit from "../components/Placestovisit";
// CORRECT import: go up two levels to src then into components
import Footer from "../components/Footer";

function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (tripId) GetTripData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const GetTripData = async () => {
    try {
      const docRef = doc(db, "trips", tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("✅ Trip data:", data);
        setTrip(data);
      } else {
        console.log("❌ No such trip!");
        setTrip(null);
      }
    } catch (err) {
      console.error("🔥 Error fetching trip data:", err);
    }
  };

  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56 space-y-10">
      {/* Information Section */}
      {trip ? <InfoSec trip={trip} /> : <p>Loading trip data...</p>}

      {/* Recommended Hotels */}
      {trip ? <Hotel trip={trip} /> : null}

      {/* Daily Activities Section */}
      <Placestovisit trip={trip} />

      <Footer />
    </div>
  );
}

export default Viewtrip;
