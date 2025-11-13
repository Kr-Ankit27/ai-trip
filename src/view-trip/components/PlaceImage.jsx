// src/view-trip/components/PlaceImage.jsx
import React, { useEffect, useState } from "react";
import { fetchImageFor, DEFAULT_IMAGE } from "../../lib/utils";

export default function PlaceImage({ query, className = "", alt = "", style = {} }) {
  const [src, setSrc] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const url = await fetchImageFor(query);
        if (mounted && url) setSrc(url);
      } catch (err) {
        if (mounted) setSrc(DEFAULT_IMAGE);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div className={`w-full h-full ${className}`} style={style}>
      <img
        src={src}
        alt={alt || query}
        className={`w-full h-full object-cover object-center transition-transform duration-500 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
        onError={(e) => {
          // replace broken remote url with local fallback
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_IMAGE;
        }}
      />
    </div>
  );
}
