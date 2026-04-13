import { Globe, Github, ExternalLink, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { Localization } from '@/types';

const LOCALIZATIONS: { id: Localization; label: string; flag?: string }[] = [
  { id: 'global', label: 'Global (ESCO)' },
  { id: 'za', label: 'South Africa', flag: '🇿🇦' },
  { id: 'ke', label: 'Kenya', flag: '🇰🇪' },
  { id: 'zm', label: 'Zambia', flag: '🇿🇲' },
];

export default function Header() {
  const localization = useAppStore((s) => s.localization);
  const setLocalization = useAppStore((s) => s.setLocalization);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    <header className="bg-white">
      <div className="container-app flex h-16 items-center justify-between">
        {/* Logo and Title */}
        <a href="/" className="flex items-center gap-3">
          <img
            src="/tabiya_logo_icononly.png"
            alt="Tabiya"
            className="h-10 w-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-lg font-semibold text-oxford-blue">
            Tabiya Inclusive Livelihoods Taxonomy
          </span>
        </a>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Localization Picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-base text-text-muted transition-colors hover:bg-soft-green hover:text-oxford-blue"
              aria-label="Select localization"
              aria-expanded={open}
            >
              <Globe size={18} />
              <span className="hidden sm:inline">
                {current.flag ? `${current.flag} ` : ''}{current.label}
              </span>
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {LOCALIZATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc.id)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-soft-green ${
                      loc.id === localization
                        ? 'bg-light-green font-medium text-oxford-blue'
                        : 'text-text-muted'
                    }`}
                  >
                    {loc.flag && <span>{loc.flag}</span>}
                    {loc.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="https://tabiya.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-oxford-blue px-4 py-2 text-base font-medium text-white transition-colors hover:bg-tabiya-green hover:text-oxford-blue"
          >
            <ExternalLink size={18} />
            <span className="hidden sm:inline">Website</span>
          </a>
          <a
            href="https://github.com/tabiya-tech/taxonomy-model-application"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-oxford-blue px-4 py-2 text-base font-medium text-white transition-colors hover:bg-tabiya-green hover:text-oxford-blue"
          >
            <Github size={18} />
            <span className="hidden sm:inline">Github</span>
          </a>
        </div>
      </div>
    </header>
  );
}
