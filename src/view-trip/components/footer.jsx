// src/components/Footer.jsx
import React from "react";
import { FaHeart, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Name and Copyright */}
        <div className="text-center sm:text-left text-sm">
          <p>
            © {year} <span className="font-semibold text-gray-900">Kumar Ankit</span>. All rights reserved.
          </p>
        </div>

        {/* Middle: A small note */}
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <FaHeart className="text-red-500" />
          <span>Made with care</span>
        </div>

        {/* Right: Optional social links */}
        <div className="flex items-center gap-4 text-gray-500">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-800 transition"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-800 transition"
          >
            <FaLinkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
