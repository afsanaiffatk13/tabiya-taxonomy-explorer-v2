import { Github, ExternalLink } from 'lucide-react';

export default function Header() {
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
        </div>
      </div>
    </header>
  );
}
