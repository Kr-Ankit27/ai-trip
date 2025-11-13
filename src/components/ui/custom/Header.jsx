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

  return (
    <header className="w-full h-20 px-4 md:px-10 flex justify-between items-center shadow-sm bg-white z-20">
      {/* --- Logo --- */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => navigate("/")}
      >
        {/* 🧭 Logo Icon (change the file below if you use another logo) */}
        <img
          src="/logo2.svg"
          alt="Travelia Logo"
          className="w-15 h-15 object-contain"
        />

        {/* Brand Name */}
        <span className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-sky-500 tracking-tight">
          Travelia-Ai
        </span>
      </div>

      {/* --- Right Section --- */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button
              onClick={handleMyTrips}
              className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 
                         text-white font-semibold py-2 px-5 rounded-md shadow-md transition duration-300 ease-in-out"
            >
              My Trips
            </button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer
                           font-semibold hover:bg-indigo-700 transition select-none focus:outline-none"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials(user)}</span>
                )}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn"
                  role="dialog"
                >
                  <div className="p-3 border-b border-gray-100 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || "User"}
                      </div>
                      {user?.email && (
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      )}
                    </div>

                    {/* X mark close */}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-lg font-bold leading-none"
                      aria-label="Close menu"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-3">
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 
                                 text-white rounded-md text-sm font-medium transition"
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
            className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 
                       text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
