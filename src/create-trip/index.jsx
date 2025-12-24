import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DestinationInput from "./Destinationinput";
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
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2 } from "lucide-react";

function CreateTrip() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hi there! I'm your AI Travel Agent. 🌍 Let's plan your dream trip. First, where do you want to go?",
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Location, 1: Days, 2: Budget, 3: Travelers, 4: Review
  const [formData, setFormData] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingGenerate, setPendingGenerate] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Read user from storage on mount
  useEffect(() => {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      setUser(JSON.parse(raw));
    } else {
      // If no user, ask for login immediately
      setShowDialog(true);
    }
  }, []);

  // ------------------ Step Logic ------------------

  const addMessage = (text, sender = "user") => {
    setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
  };

  const handleNextStep = (key, value, label = null) => {
    // 1. Save Data
    setFormData((prev) => ({ ...prev, [key]: value }));

    // 2. Add User Message (UI)
    addMessage(label || value, "user");

    // 3. Trigger AI Response & Next Step (Delayed for realism)
    setCurrentStep((prev) => prev + 1);
  };

  // Effect to trigger AI question when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 1) {
        addMessage(`Great choice! 🤩 How many days are you planning to stay?`, "ai");
      } else if (currentStep === 2) {
        addMessage("Got it. What's your budget for this trip? 💸", "ai");
      } else if (currentStep === 3) {
        addMessage("Who are you traveling with? 👨‍👩‍👧‍👦", "ai");
      } else if (currentStep === 4) {
        addMessage("Awesome! I have everything I need. Wishing you a fantastic trip! 🌟 Shall I generate your itinerary now? 🚀", "ai");
      }
    }, 600); // Natural delay

    return () => clearTimeout(timer);
  }, [currentStep]);


  // ------------------ Generators ------------------

  const OnGenarateTrip = async () => {
    if (!user) {
      setPendingGenerate(true);
      setShowDialog(true);
      return;
    }

    // Check validation just in case
    if (!formData.location || !formData.days || !formData.budget || !formData.travelers) {
      toast.error("Missing information!");
      return;
    }

    setLoading(true);
    addMessage("Generating your personalized trip... please wait! ⏳", "ai");

    try {
      const Final_Prompt = AI_Prompt.replace("{location}", formData.location)
        .replace("{days}", formData.days)
        .replace("{travelers}", formData.travelers)
        .replace("{budget}", formData.budget)
        .replace("{location}", formData.location);

      // using the chat service
      // We'll collect the stream here manually if chat returns a stream, 
      // or just use it if it returns string. 
      // Note: The previous robust logic is good, but let's simplify for this UI rewrite 
      // while maintaining the core functionality.

      const result = await chat([], Final_Prompt);

      let text = "";
      if (typeof result === 'string') {
        text = result;
      } else if (result && typeof result[Symbol.asyncIterator] === 'function') {
        for await (const chunk of result) text += chunk;
      } else {
        text = JSON.stringify(result);
      }

      // Parse JSON
      let tripData = null;
      try {
        // 1. Try direct parse
        tripData = JSON.parse(text);
      } catch {
        // 2. Try match regex
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) tripData = JSON.parse(match[0]);
      }

      if (tripData) {
        const docId = Date.now().toString();
        await setDoc(doc(db, "trips", docId), {
          userSelection: formData,
          tripData: tripData,
          userEmail: user?.email,
          id: docId,
          createdAt: new Date().toISOString()
        });
        navigate("/view-trip/" + docId);
      } else {
        console.error("Failed to parse", text);
        toast.error("Failed to generate trip. Please try again.");
        setLoading(false);
      }

    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };


  // ------------------ Google Login ------------------
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const profile = res.data;
        localStorage.setItem("userInfo", JSON.stringify({ ...profile, token: tokenResponse.access_token }));

        setUser(profile);
        setShowDialog(false);
        window.dispatchEvent(new Event("userChanged"));

        // If we were waiting to generate
        if (pendingGenerate) {
          setPendingGenerate(false);
          // We likely need to trigger generation if we are at step 4
          if (currentStep === 4) {
            setTimeout(() => OnGenarateTrip(), 500);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Login failed");
      }
    },
    onError: (e) => console.error(e),
  });


  // ------------------ RENDER ------------------

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gray-900 text-white font-sans">

      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop')" }}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

      {/* Main Chat Container */}
      <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col h-[80vh]">

        {/* Title (Floating) */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">TripAI Assistant</h1>
          <div className="flex justify-center gap-2 mt-2">
            {[0, 1, 2, 3, 4].map(step => (
              <div key={step} className={`h-2 w-2 rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-blue-500 w-6' : 'bg-gray-600'}`} />
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2 no-scrollbar pb-32">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-md text-lg leading-relaxed
                            ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white/10 border border-white/20 text-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.sender === "ai" && <Bot className="w-4 h-4 mb-1 text-blue-300 inline mr-2" />}
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-5 py-3 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input Area (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/80 backdrop-blur-xl border-t border-white/10">

          {/* Step 0: Location (Custom Component input) */}
          {currentStep === 0 && (
            <div className="relative">
              <DestinationInput onSelect={(place) => handleNextStep("location", place.properties.formatted)} />
              <p className="text-xs text-gray-400 mt-2 text-center">Type and select a destination from the list</p>
            </div>
          )}

          {/* Step 1: Days (Number Input) */}
          {currentStep === 1 && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Ex. 3 days"
                max={6}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) handleNextStep("days", e.currentTarget.value, `${e.currentTarget.value} Days`);
                }}
                id="daysInput"
              />
              <button
                onClick={() => {
                  const val = document.getElementById('daysInput').value;
                  if (val) handleNextStep("days", val, `${val} Days`);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-bold"
              >
                <Send size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Budget (Options) */}
          {currentStep === 2 && (
            <div className="grid grid-cols-3 gap-2">
              {SelectBudgetOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleNextStep("budget", opt.title, opt.title)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Travelers (Options) */}
          {currentStep === 3 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SelectTravelersList.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleNextStep("travelers", opt.title, opt.title)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Generate (Final Button) */}
          {currentStep === 4 && (
            <button
              onClick={OnGenarateTrip}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Planning your Trip..." : "✨ Generate My Adventure"}
            </button>
          )}

        </div>
      </div>

      {/* Google Login Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Almost there! 🔓</h2>
            <p className="text-gray-500 text-center mb-6">Sign in to save your trip and access it anywhere.</p>
            <button
              onClick={login}
              className="flex items-center justify-center gap-3 w-full py-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-sm"
            >
              <FcGoogle size={24} />
              <span className="font-semibold text-gray-700">Continue with Google</span>
            </button>
            <button onClick={() => {
              setShowDialog(false);
              setPendingGenerate(false);
            }} className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default CreateTrip;
