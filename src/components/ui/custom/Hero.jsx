import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden text-white">
      {/* --- Background with AI + travel theme --- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
        }}
      ></div>

      {/* --- Animated gradient overlay --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-purple-900/60 to-black/80 animate-gradient-slow" />

      {/* --- Glow orbs for futuristic AI vibe --- */}
      <div className="absolute -top-32 -left-16 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700" />

      {/* --- Main content --- */}
      <motion.div
        className="relative z-10 text-center max-w-3xl px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 drop-shadow-md">
            Travelia —
          </span>{" "}
          <span className="text-purple-300">Where AI Meets Adventure</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-200 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
          Plan smarter, explore deeper, and travel effortlessly with your personal AI travel assistant.
        </p>

        <Link to="/create-trip">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold
                       py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out
                       hover:from-indigo-700 hover:to-purple-700 focus:outline-none"
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 blur-lg hover:opacity-40 transition duration-500" />
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;
