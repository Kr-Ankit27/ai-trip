// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn(...inputs) - helper to merge Tailwind classnames
 * usage: cn("p-4", condition && "text-red-500")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ---------------- Image fetcher (Pixabay) ---------------- */

const CACHE_KEY = "img_cache_v1";
// Local fallback image in your public/ directory.
// Put a file at public/travel.jpg (recommended) or change this path.
export const DEFAULT_IMAGE = "/travel.jpg";

const PIXABAY_KEY = import.meta.env.VITE_PIXABAY_KEY || "";
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "";

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(obj) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch { }
}

function normalize(q) {
  return String(q || "").trim().toLowerCase();
}

/**
 * fetchImageFor(query) -> returns image URL
 * 1. Tries Unsplash (Premium quality)
 * 2. Tries Pixabay (Secondary fallback)
 * 3. Returns DEFAULT_IMAGE (Static fallback)
 */
export async function fetchImageFor(query) {
  const q = normalize(query);
  if (!q) return DEFAULT_IMAGE;

  // check cache
  const cache = readCache();
  if (cache[q]) return cache[q];

  // 1. Try Unsplash
  if (UNSPLASH_KEY) {
    try {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&client_id=${UNSPLASH_KEY}&per_page=1&orientation=landscape`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results[0]) {
          const imageUrl = data.results[0].urls.regular;
          cacheImage(cache, q, imageUrl);
          return imageUrl;
        }
      }
    } catch (err) {
      console.warn("Unsplash fetch failed, trying fallback...", err);
    }
  }

  // 2. Try Pixabay (Fallback)
  if (PIXABAY_KEY) {
    const pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q.slice(0, 80))}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`;
    try {
      const res = await fetch(pixabayUrl);
      if (res.ok) {
        const data = await res.json();
        const hit = (data.hits && data.hits[0]) || null;
        if (hit?.webformatURL) {
          cacheImage(cache, q, hit.webformatURL);
          return hit.webformatURL;
        }
      }
    } catch (err) {
      console.error("Pixabay fetch failed", err);
    }
  }

  return DEFAULT_IMAGE;
}

function cacheImage(cache, q, imageUrl) {
  cache[q] = imageUrl;
  const keys = Object.keys(cache);
  if (keys.length > 300) {
    delete cache[keys[0]];
  }
  writeCache(cache);
}
