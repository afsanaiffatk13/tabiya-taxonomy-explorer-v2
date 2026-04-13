import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Localization } from '@/types';

const LOCALIZATIONS: { id: Localization; label: string; shortCode: string; flagCode?: string }[] = [
  { id: 'global', label: 'Global', shortCode: 'ESCO' },
  { id: 'za', label: 'South Africa', shortCode: 'ZA', flagCode: 'za' },
  { id: 'ke', label: 'Kenya', shortCode: 'KE', flagCode: 'ke' },
  { id: 'zm', label: 'Zambia', shortCode: 'ZM', flagCode: 'zm' },
];

function FlagIcon({ code, size = 16 }: { code: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      className="inline-block rounded-sm"
      style={{ objectFit: 'cover' }}
    />
  );
}

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

  const current = LOCALIZATIONS.find((l) => l.id === localization) ?? LOCALIZATIONS[0]!;

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
        {current.flagCode ? <FlagIcon code={current.flagCode} /> : <Globe size={16} />}
        <span>{current.label}</span>
        <span className="text-xs font-normal text-text-muted">({current.shortCode})</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[220px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
              {loc.flagCode ? <FlagIcon code={loc.flagCode} /> : <Globe size={16} />}
              <span>{loc.label}</span>
              <span className="text-xs font-normal text-text-muted">({loc.shortCode})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
