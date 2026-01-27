"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface GeoNameResult {
  name: string;
  adminName1?: string;
  countryName: string;
  fcodeName?: string;
}

export default function LocationInput({ value, onChange, required = false }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // featureClass=P includes all populated places: cities, towns, villages, hamlets, etc.
      // Removed featureCode filter to include ALL populated place types
      const response = await fetch(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=10&featureClass=P&username=demo`
      );
      const data = await response.json();

      if (data.geonames) {
        const locations = data.geonames.map((item: GeoNameResult) => {
          const parts = [item.name];
          if (item.adminName1) parts.push(item.adminName1);
          parts.push(item.countryName);
          // Add the type of place (village, town, city, etc.)
          let placeType = item.fcodeName || "";
          if (placeType && !["city", "capital of a political entity", "populated place"].includes(placeType.toLowerCase())) {
            return `${parts.join(", ")} (${placeType})`;
          }
          return parts.join(", ");
        });
        setSuggestions(locations);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(value), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, searchLocations]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium mb-1">Location</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        required={required}
        placeholder="Search any location (city, town, village, hamlet...)"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
      />
      <p className="text-xs text-slate-500 mt-1">Type to search worldwide locations including villages and small towns</p>
      {loading && <span className="absolute right-3 top-9 text-xs text-gray-400">...</span>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
          {suggestions.map((loc, i) => (
            <li
              key={i}
              onClick={() => { onChange(loc); setShowSuggestions(false); }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
