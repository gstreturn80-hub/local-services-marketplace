"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2, ArrowRight } from "lucide-react";

interface AreaOption {
  city: string;
  area: string;
  pincode: string;
  state: string;
}

interface CategoryOption {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  type: string;
  isEnabled: boolean;
}

export default function SearchBar() {
  const router = useRouter();
  
  // Search state
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  
  // Autocomplete lists
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Suggestions states
  const [serviceSuggestions, setServiceSuggestions] = useState<CategoryOption[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<AreaOption[]>([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // Fetch areas
      const areaRes = await fetch("/api/areas");
      if (areaRes.ok) {
        const areaData = await areaRes.json();
        setAreas(areaData);
      }
    } catch (e) {
      console.error("Error fetching search bar autocomplete options:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter service suggestions
  useEffect(() => {
    if (!service.trim()) {
      setServiceSuggestions([]);
      return;
    }
    const filtered = categories.filter((c: CategoryOption) => 
      c.name.toLowerCase().includes(service.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(service.toLowerCase()))
    );
    setServiceSuggestions(filtered);
  }, [service, categories]);

  // Filter location suggestions
  useEffect(() => {
    if (!location.trim()) {
      setLocationSuggestions([]);
      return;
    }
    const query = location.toLowerCase();
    const filtered = areas.filter((a: AreaOption) => 
      a.city.toLowerCase().includes(query) ||
      a.area.toLowerCase().includes(query) ||
      a.pincode.includes(query)
    );
    setLocationSuggestions(filtered);
  }, [location, areas]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse location parameters
    let searchUrl = `/search?`;
    const params: string[] = [];

    if (service.trim()) {
      params.push(`category=${encodeURIComponent(service.trim())}`);
    }

    if (location.trim()) {
      // Check if location is a 6-digit pincode
      if (/^\d{6}$/.test(location.trim())) {
        params.push(`pincode=${location.trim()}`);
      } else {
        // Check if matches an existing area/city option
        const matched = areas.find((a: AreaOption) => 
          a.area.toLowerCase() === location.toLowerCase() ||
          a.city.toLowerCase() === location.toLowerCase()
        );
        if (matched) {
          if (matched.area.toLowerCase() === location.toLowerCase()) {
            params.push(`area=${encodeURIComponent(matched.area)}`);
            params.push(`pincode=${matched.pincode}`);
          } else {
            params.push(`city=${encodeURIComponent(matched.city)}`);
          }
        } else {
          params.push(`search=${encodeURIComponent(location.trim())}`);
        }
      }
    }

    searchUrl += params.join("&");
    router.push(searchUrl);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-stretch rounded-2xl border border-border bg-card p-2 shadow-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all gap-2"
    >
      {/* Location Search Box */}
      <div className="relative flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-border gap-3">
        <MapPin className="h-5 w-5 text-primary shrink-0" />
        <div className="w-full">
          <label className="block text-3xs font-semibold uppercase tracking-wider text-muted-foreground">Location</label>
          <input
            type="text"
            placeholder="City, area, or pincode (e.g. 560034)"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationDropdown(true);
            }}
            onFocus={() => setShowLocationDropdown(true)}
            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder-muted-foreground/60 font-medium py-0.5"
          />
        </div>

        {/* Location Dropdown */}
        {showLocationDropdown && locationSuggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-3 w-full rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in duration-100 z-50">
            {locationSuggestions.slice(0, 5).map((opt: AreaOption, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setLocation(`${opt.area}, ${opt.city} (${opt.pincode})`);
                  setShowLocationDropdown(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-secondary transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">{opt.area}</span>
                <span className="text-muted-foreground">{opt.city}, {opt.state} ({opt.pincode})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Service Search Box */}
      <div className="relative flex-1 flex items-center px-4 py-2 gap-3">
        <Search className="h-5 w-5 text-primary shrink-0" />
        <div className="w-full">
          <label className="block text-3xs font-semibold uppercase tracking-wider text-muted-foreground">What service do you need?</label>
          <input
            type="text"
            placeholder="Electrician, Plumber, Painting..."
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setShowServiceDropdown(true);
            }}
            onFocus={() => setShowServiceDropdown(true)}
            onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder-muted-foreground/60 font-medium py-0.5"
          />
        </div>

        {/* Service Dropdown */}
        {showServiceDropdown && serviceSuggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-3 w-full rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in duration-100 z-50">
            {serviceSuggestions.slice(0, 5).map((opt: CategoryOption, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setService(opt.name);
                  setShowServiceDropdown(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-secondary transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{opt.name}</span>
                  <span className="text-3xs text-muted-foreground truncate max-w-[280px]">{opt.description}</span>
                </div>
                <span className="text-3xs uppercase rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary tracking-wider">{opt.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm px-6 py-3 md:py-auto flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        <span>Search</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
