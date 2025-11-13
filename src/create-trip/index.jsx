import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- import added
import DestinationInput from "./DestinationInput";
import {
  AI_Prompt,
  SelectBudgetOptions,
  SelectTravelersList,
} from "@/constants/options";
import { toast } from "react-hot-toast";
import { chat } from "../service/AIModel";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/firebaseConfig";
import { retryAsync } from "../lib/retry"; // <<-- added retry import

function CreateTrip() {
  const [formData, setFormData] = useState({});
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  const navigate = useNavigate(); // <-- make sure react-router is set up in your app

  // ---------------- small helper: try to recover JSON from AI raw output ----------------
  function recoverAndParseJson(raw) {
    if (!raw || typeof raw !== "string") {
      throw new Error("Empty or non-string AI response");
    }
    const s = raw.trim();

    // 1) direct parse
    try {
      return JSON.parse(s);
    } catch (e) {
      // continue
    }

    // 2) find first {...} or [...]
    const braceMatch = s.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch (e) {
        // continue
      }
    }

    // 3) take substring between first { and last }
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = s.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // continue
      }
    }

    // nothing worked
    const preview = s.length > 1200 ? s.slice(0, 1200) + "..." : s;
    const err = new Error("Unable to parse AI response as JSON");
    err.raw = preview;
    throw err;
  }

  // ---------------- Handle Input ----------------
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Generate Trip (with retry) ----------------
  // ---------------- Generate Trip (robust + retry + stream handling) ----------------
const OnGenarateTrip = async () => {
  if (!user) {
    setPendingGenerate(true);
    setShowDialog(true);
    return;
  }

  if (
    !formData?.location ||
    !formData?.travelers ||
    !formData?.budget ||
    !formData?.days
  ) {
    toast.error("Please fill all fields before generating your trip!");
    return;
  }

  if (Number(formData.days) > 6) {
    toast.error("Trips longer than 6 days are not allowed right now!");
    return;
  }

  setLoading(true);
  setGeneratedTrip(null);
  toast.success("🎉 Generating your trip... Please wait!");

  // helper: collect async iterator/stream into a string if needed
  const collectStreamToString = async (maybeStream) => {
    if (maybeStream == null) return maybeStream;
    // already a string
    if (typeof maybeStream === "string") return maybeStream;
    // already an object (parsed)
    if (typeof maybeStream === "object" && !(maybeStream[Symbol.asyncIterator])) return maybeStream;
    // async iterator or stream-like
    if (typeof maybeStream[Symbol.asyncIterator] === "function") {
      let out = "";
      try {
        for await (const chunk of maybeStream) {
          // chunk may be string or object with text field
          if (typeof chunk === "string") out += chunk;
          else if (typeof chunk === "object" && chunk != null) {
            // try common fields
            if (typeof chunk.text === "string") out += chunk.text;
            else if (typeof chunk.content === "string") out += chunk.content;
            else out += JSON.stringify(chunk);
          } else {
            out += String(chunk);
          }
        }
      } catch (err) {
        console.warn("collectStreamToString: error while collecting stream", err);
      }
      return out;
    }
    // unknown type, return as-is
    return maybeStream;
  };

  try {
    const Final_Prompt = AI_Prompt.replace("{location}", formData.location)
      .replace("{days}", formData.days)
      .replace("{travelers}", formData.travelers)
      .replace("{budget}", formData.budget)
      .replace("{location}", formData.location);

    console.log("🧠 Final Prompt:", Final_Prompt);

    // retry wrapper around the chat call
    const rawResponse = await retryAsync(
      async (attemptIndex) => {
        console.log(`🌀 Generating trip (attempt ${attemptIndex + 1})...`);
        // call your chat() function (may return string, object, or stream)
        const res = await chat([], Final_Prompt);
        return res;
      },
      {
        retries: 3,
        minDelay: 1500,
        maxDelay: 7000,
        factor: 2,
        jitter: true,
        shouldRetry: (err) => {
          if (!err) return false;
          const m = String(err?.message || "").toLowerCase();
          return (
            m.includes("503") ||
            m.includes("unavailable") ||
            m.includes("overloaded") ||
            m.includes("rate limit") ||
            m.includes("429") ||
            m.includes("timeout")
          );
        },
      }
    );

    // If we get here, rawResponse is whatever chat() returned (string/object/stream)
    // Collect into a string if needed
    const jsonResponseString = await collectStreamToString(rawResponse);

    // Debug logging: type + preview
    console.log("✅ Raw AI Response (full):", jsonResponseString);
    const rawType = typeof jsonResponseString;
    let rawPreview = "";
    if (jsonResponseString == null) {
      rawPreview = String(jsonResponseString);
    } else if (rawType === "string") {
      rawPreview =
        jsonResponseString.length > 1200
          ? jsonResponseString.slice(0, 1200) + "..."
          : jsonResponseString;
    } else {
      try {
        rawPreview = JSON.stringify(jsonResponseString).slice(0, 1200);
      } catch {
        rawPreview = String(jsonResponseString);
      }
    }
    console.log("DEBUG: raw type:", rawType, "preview:", rawPreview);

    // Robust parsing logic
    let parsedData = null;

    // 1) already parsed object
    if (jsonResponseString && rawType === "object") {
      parsedData = jsonResponseString;
    }
    // 2) non-empty string -> attempt robust parse
    else if (rawType === "string" && jsonResponseString.trim().length > 0) {
      try {
        parsedData =
          typeof jsonResponseString === "string"
            ? recoverAndParseJson(jsonResponseString)
            : jsonResponseString;
      } catch (parseErr) {
        console.error("⚠️ Failed to parse AI response (recoverAndParseJson):", parseErr);
        if (parseErr.raw) console.error("----- RAW PREVIEW -----\n", parseErr.raw);
        console.error("Full AI raw output:", jsonResponseString);
        toast.error("AI returned invalid response. Check console for raw output.");
        setLoading(false);
        return;
      }
    } else {
      // empty or unexpected
      console.error(
        "⚠️ AI returned empty or unexpected response. Type:",
        rawType,
        "Preview:",
        rawPreview
      );
      toast.error("AI returned an empty response. Try again shortly.");
      setLoading(false);
      return;
    }

    // proceed with parsedData
    console.log("🧩 Parsed AI Data:", parsedData);
    setGeneratedTrip(parsedData);

    // Save and navigate
    try {
      const docId = await SaveAiTrip(parsedData);
      console.log("Saved AI trip to Firestore. id:", docId);

      setLoading(false);
      navigate("/view-trip/" + docId);
      return;
    } catch (saveErr) {
      console.error("Failed to save AI trip:", saveErr);
      toast.error("Failed to save trip to database (you can retry).");
    }

    toast.success("Trip generated successfully!");
  } catch (error) {
    console.error("❌ Error generating trip after retries:", error);
    const msg = String(error?.message || "").toLowerCase();
    if (msg.includes("503") || msg.includes("overloaded")) {
      toast.error("⚠️ AI model is busy — please try again shortly.");
    } else if (msg.includes("429") || msg.includes("rate limit")) {
      toast.error("⏳ Rate limit reached — retry in a few seconds.");
    } else {
      toast.error("Failed to generate trip. Please try again later.");
    }
  } finally {
    setLoading(false);
  }
};

  // ---------------- Save Trip ----------------
  // now returns docId string on success
  const SaveAiTrip = async (tripData) => {
    try {
      const raw = localStorage.getItem("userInfo");
      const userInfo = raw ? JSON.parse(raw) : null;
      const docId = Date.now().toString();

      await setDoc(doc(db, "trips", docId), {
        userSelection: formData,
        tripData: tripData,
        userEmail: userInfo?.email || null,
        id: docId,
        createdAt: new Date().toISOString(),
      });

      return docId;
    } catch (err) {
      // rethrow so caller can handle toast/log
      throw err;
    }
  };

  // ---------------- Google Login ----------------
 const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      const profile = res.data;

      // ✅ Save login info in localStorage
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...profile,
          token: tokenResponse.access_token,
          expires_in: tokenResponse.expires_in,
        })
      );

      // 🔔 Notify Header (and any other component) to update instantly
      window.dispatchEvent(new Event("userChanged"));

      setUser(profile);
      toast.success(`Welcome, ${profile.name}!`);
      setShowDialog(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to fetch user profile.");
    }
  },
  onError: (error) => {
    console.error("Login failed:", error);
    toast.error("Login failed. Please try again.");
  },
});


  // ---------------- Auto Generate After Login ----------------
  useEffect(() => {
    if (user && pendingGenerate) {
      setPendingGenerate(false);
      setTimeout(() => {
        OnGenarateTrip();
      }, 400);
    }
  }, [user]);

  // ---------------- UI ----------------
  return (
    <div className="bg-gray-100 px-5 sm:px-10 md:px-20 lg:px-40 xl:px-56 py-10 relative">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 tracking-wide">
          Tell us your travel preferences 🏕️🛩️
        </h2>
        <p className="text-gray-700 text-sm sm:text-base max-w-2xl leading-relaxed">
          Our AI Trip Planner personalizes trips based on your interests and
          travel style. Get smart recommendations in seconds — no stress, just
          adventure.
        </p>
      </div>

      {/* Form Sections */}
      <div className="mt-16 flex flex-col gap-8">
        {/* Destination */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 tracking-wide">
            What is your destination?
          </h2>
          <DestinationInput
            onSelect={(place) =>
              handleInputChange("location", place.properties.formatted)
            }
          />
        </div>

        {/* Days */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 tracking-wide">
            How many days do you plan to travel?
          </h2>
          <input
            placeholder="Enter number of days"
            type="number"
            onChange={(e) => handleInputChange("days", e.target.value)}
            className="w-full max-w-3xl px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Budget */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 tracking-wide">
            What is your Budget?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-5 gap-5">
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("budget", item.title)}
                className={`flex flex-col items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.budget === item.title
                    ? "border-blue-500 bg-white shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:shadow-md hover:border-blue-400"
                }`}
              >
                <div className="mb-3">{item.icon}</div>
                <h2 className="font-semibold text-lg text-gray-800">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 text-center mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Travelers */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 tracking-wide">
            Who do you plan to travel with?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-5 gap-5">
            {SelectTravelersList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleInputChange("travelers", item.title)}
                className={`flex flex-col items-center p-5 border rounded-xl cursor-pointer transition-all duration-300 ${
                  formData.travelers === item.title
                    ? "border-blue-500 bg-white shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:shadow-md hover:border-blue-400"
                }`}
              >
                <div className="mb-3">{item.icon}</div>
                <h2 className="font-semibold text-lg text-gray-800">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 text-center mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="my-10 flex justify-end">
        <button
          onClick={OnGenarateTrip}
          disabled={loading}
          className={`px-6 py-3 text-white font-semibold rounded-xl shadow-md transition-all duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
          }`}
        >
          {loading ? "Generating..." : "Generate My Trip"}
        </button>
      </div>

      {/* Login Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md shadow-2xl border border-gray-200 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 tracking-wide text-center">
              Sign in to Continue
            </h2>
            <p className="text-gray-700 text-sm sm:text-base text-center mb-6">
              You need to sign in before generating your AI-powered trip plan.
            </p>
            <button
              onClick={login}
              className="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-300 transform hover:scale-[1.03] hover:shadow-md hover:border-indigo-400"
            >
              <FcGoogle size={24} />
              <span className="font-medium text-gray-700 hover:text-indigo-700 transition-colors duration-300">
                Sign in with Google
              </span>
            </button>
            <button
              onClick={() => {
                setShowDialog(false);
                setPendingGenerate(false);
              }}
              className="mt-6 w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md transition-all duration-300 transform hover:scale-[1.03] hover:bg-indigo-700 hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;
