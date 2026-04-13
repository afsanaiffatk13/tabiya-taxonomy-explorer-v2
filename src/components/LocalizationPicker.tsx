import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Localization } from '@/types';

const LOCALIZATIONS: { id: Localization; label: string; flag?: string }[] = [
  { id: 'global', label: 'Global (ESCO)' },
  { id: 'za', label: 'South Africa', flag: '🇿🇦' },
  { id: 'ke', label: 'Kenya', flag: '🇰🇪' },
  { id: 'zm', label: 'Zambia', flag: '🇿🇲' },
];

export default function LocalizationPicker() {
  const localization = useAppStore((s) => s.localization);
  const setLocalization = useAppStore((s) => s.setLocalization);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LOCALIZATIONS.find((l) => l.id === localization) ?? { id: 'global' as Localization, label: 'Global (ESCO)' };

  function handleSelect(id: Localization) {
    if (id !== localization) {
      setLocalization(id);
    }
    setOpen(false);
  }

  return (
    <div className="relative ml-auto" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded px-3 py-2 text-sm font-bold text-oxford-blue transition-colors hover:bg-tabiya-green"
        aria-label="Select localization"
        aria-expanded={open}
      >
        {current.flag && <span>{current.flag}</span>}
        <span>{current.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {LOCALIZATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-tabiya-green ${
                loc.id === localization
                  ? 'bg-soft-green text-oxford-blue'
                  : 'text-oxford-blue'
              }`}
            >
              {loc.flag && <span>{loc.flag}</span>}
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
