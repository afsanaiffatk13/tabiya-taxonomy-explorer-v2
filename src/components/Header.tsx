import { Globe, Github, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Header() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    navigate(`/${newLang}/about`);
  };

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

          {/* Language Toggle - subtle */}
          <button
            onClick={toggleLanguage}
            className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-base text-text-muted transition-colors hover:bg-soft-green hover:text-oxford-blue"
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
