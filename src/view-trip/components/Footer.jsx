import React from "react";
import { Heart, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 py-10 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-8">

        {/* Top Section: Branding & Links */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Kr-Ankit27"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors duration-300"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/kumar-ankit-bb9a30257/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors duration-300"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Bottom Section: Copyright & Heart */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </motion.div>
            <span>by Kumar Ankit</span>
          </div>

          <p className="text-slate-500 text-[11px] uppercase tracking-[0.2em] font-bold">
            © {year} All Rights Reserved
          </p>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-[100px] pointer-events-none" />
    </footer>
  );
}
