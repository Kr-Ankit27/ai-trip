import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white">
      {/* --- Background: Tropical Beach --- */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop')", // Stunning blue Maldives water + palm
        }}
      >
        {/* Subtle overlay to ensure text readability without ruining the vibe */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* --- Main Content --- */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-tight drop-shadow-md">
          Discover the world like never before! <br />
          Your journey starts here
        </h1>

        <p className="text-lg md:text-2xl text-white/90 font-light mb-12 max-w-2xl drop-shadow-sm">
          Plan smarter, explore deeper, and travel effortlessly with your personal AI travel assistant.
        </p>

        {/* --- Minimalist CTA Button --- */}
        <Link to="/create-trip">
          <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-2xl flex items-center gap-3">
            <span className="relative z-10 tracking-wide">Get Started</span>
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white transition-colors">
              <Search className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </Link>

      </motion.div>
    </section>
  );
};

export default Hero;
