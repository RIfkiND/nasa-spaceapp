import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { FieldProfile } from '../../types/domain';
import { Search, X, MapPin, Filter } from 'lucide-react';

interface FloatingSearchBarProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const QUICK_FILTERS = [
  { id: 'all', label: 'Semua Petak' },
  { id: 'clay_loam', label: 'Clay Loam' },
  { id: 'steep', label: 'Lereng >8%' },
  { id: 'high_awc', label: 'AWC Tinggi (>140mm)' },
];

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  fields,
  selectedField,
  onSelectField,
  activeFilter,
  onFilterChange,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search suggestions
  const searchResults = useMemo(() => {
    if (!query.trim()) return fields;
    const q = query.toLowerCase();
    return fields.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.soil.texture.toLowerCase().includes(q) ||
        f.currentRotation.some((c) => c.toLowerCase().includes(q))
    );
  }, [fields, query]);

  const handleSelect = (field: FieldProfile) => {
    onSelectField(field);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md sm:max-w-lg">
      {/* Floating Search Input Card */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-[#E6EBF0] bg-white/95 px-4 py-2.5 shadow-float backdrop-blur-md transition focus-within:border-[#237F8E] focus-within:ring-2 focus-within:ring-[#237F8E]/20">
        <Search className="h-4 w-4 shrink-0 text-[#237F8E]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari petak, desa, tanah (misal: Karangrau, Clay Loam)..."
          className="w-full bg-transparent text-xs font-medium text-[#14232B] placeholder:text-[#5F6B74] focus:outline-hidden"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6B74]">
          <Filter className="h-3 w-3 text-[#237F8E]" /> Filter:
        </span>
        {QUICK_FILTERS.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-[#237F8E] text-white shadow-xs'
                  : 'border border-[#E6EBF0] bg-white/90 text-[#5F6B74] backdrop-blur-sm hover:border-[#237F8E] hover:text-[#14232B]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#E6EBF0] bg-white/95 p-2 shadow-float backdrop-blur-md">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#5F6B74]">
              Tidak ditemukan petak dengan kata kunci &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6B74]">
                Hasil Penelusuran ({searchResults.length} petak)
              </div>
              {searchResults.map((field) => {
                const isSelected = field.id === selectedField.id;
                return (
                  <div
                    key={field.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(field)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(field);
                      }
                    }}
                    className={`cursor-pointer flex items-start justify-between gap-3 rounded-xl p-3 transition focus:outline-none focus:ring-1 focus:ring-[#237F8E] ${
                      isSelected
                        ? 'bg-[#E3F1F3] text-[#1B6572] font-semibold'
                        : 'text-[#14232B] hover:bg-[#F7F9FB]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E3F1F3] text-[#237F8E]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#14232B]">{field.name}</p>
                        <p className="text-[11px] text-[#5F6B74]">
                          Desa {field.village}, Kec. {field.district}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#237F8E] border border-[#E6EBF0]">
                        {field.soil.texture}
                      </span>
                      <p className="mt-0.5 text-[10px] text-[#5F6B74] tabular-nums">
                        {field.areaHectares} ha &middot; {field.soil.slope}% lereng
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
