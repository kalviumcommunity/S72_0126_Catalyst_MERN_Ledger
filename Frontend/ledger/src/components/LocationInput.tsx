"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface NominatimResult {
  display_name: string;
  name: string;
  type: string;
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
      // Using OpenStreetMap Nominatim API - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LedgerApp/1.0'
          }
        }
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const locations = data.map((item: NominatimResult) => item.display_name);
        setSuggestions(locations);
      }
    } catch (err) {
      console.error('Location search error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(value), 400);
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
      <label className="block text-sm text-secondary mb-1.5">Location</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        required={required}
        placeholder="Search any location (city, town, village...)"
        className="w-full bg-input border border-theme rounded-lg px-4 py-2.5 text-theme placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />
      <p className="text-xs text-muted mt-1">Type to search worldwide locations</p>
      {loading && <span className="absolute right-3 top-9 text-xs text-muted">...</span>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-card border border-theme rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((loc, i) => (
            <li
              key={i}
              onClick={() => { onChange(loc); setShowSuggestions(false); }}
              className="px-4 py-2.5 text-sm text-theme hover:bg-input cursor-pointer transition-colors"
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
