import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // 🧠 Read user info from localStorage
  const readUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("userInfo");
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error("Error parsing user info:", err);
      return null;
    }
  };

  // 📡 Listen for login/logout events
  useEffect(() => {
    setUser(readUserFromStorage());

    const onUserChanged = () => setUser(readUserFromStorage());
    const onStorage = (e) => {
      if (e.key === "userInfo") setUser(readUserFromStorage());
    };

    window.addEventListener("userChanged", onUserChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("userChanged", onUserChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // 🧩 Close dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  // 🧭 Handlers
  const handleSignIn = () => navigate("/create-trip");
  const handleMyTrips = () => navigate("/my-trips");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("userChanged"));
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const initials = (u) =>
    (u?.given_name?.[0] || u?.name?.[0] || "U").toUpperCase();

  const location = window.location;
  const isHome = location.pathname === "/";

  return (
    <header
      className={`w-full h-20 px-4 md:px-10 flex justify-between items-center z-50 transition-all duration-300
        ${isHome ? 'absolute top-0 left-0 bg-transparent text-white' : 'shadow-sm bg-white text-black'}
      `}
    >
      {/* --- Logo --- */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        <div className={`p-2 rounded-full ${isHome ? 'bg-white/20 backdrop-blur-sm' : 'bg-indigo-50'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isHome ? "text-white" : "text-indigo-600"}>
            <path d="M2 12h20" /><path d="M20 12v1a9 9 0 0 1-18 0v-1" /><path d="M13 2 9 22" /><path d="M20 22 4 2" />
          </svg>
        </div>

        <span className={`text-xl md:text-2xl font-bold tracking-tight ${isHome ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-sky-500'}`}>
          TripAi
        </span>
      </div>

      {/* --- Center Nav REMOVED --- */}

      {/* --- Right Section --- */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button
              onClick={handleMyTrips}
              className={`font-semibold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out
                ${isHome ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              `}
            >
              My Trips
            </button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition select-none focus:outline-none overflow-hidden
                    ${isHome ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white' : 'bg-gray-100 text-indigo-600 border border-gray-200'}
                `}
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold">{initials(user)}</span>
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 text-gray-800 animate-fadeIn">
                  <div className="p-4 border-b border-gray-100 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleMyTrips}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                      My Trips
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className={`font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out
                ${isHome ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}
            `}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
