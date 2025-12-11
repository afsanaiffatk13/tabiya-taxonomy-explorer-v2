import { Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Header() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    navigate(`/${newLang}/about`);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container-app flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.svg"
            alt="Tabiya"
            className="h-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-lg font-semibold text-oxford-blue">Taxonomy Explorer</span>
        </a>

        {/* Language Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-oxford-blue transition-colors hover:border-oxford-blue"
            aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}
          >
            <Globe size={18} />
            <span>{lang === 'en' ? 'EN' : 'ES'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
