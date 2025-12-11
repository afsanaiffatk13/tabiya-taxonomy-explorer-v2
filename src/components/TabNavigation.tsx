import { NavLink, useParams, useLocation } from 'react-router-dom';
import { Info, Search, Briefcase, Lightbulb } from 'lucide-react';

const tabs = [
  { id: 'about', label: 'About', icon: Info },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'occupations', label: 'Occupations', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Lightbulb },
] as const;

export default function TabNavigation() {
  const { lang = 'en' } = useParams<{ lang: string }>();
  const location = useLocation();

  const isTabActive = (tabId: string) => {
    return location.pathname.includes(`/${lang}/${tabId}`);
  };

  return (
    <nav className="border-b border-gray-200 bg-white" aria-label="Main navigation">
      <div className="container-app">
        <div className="flex gap-1" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={`/${lang}/${id}`}
              role="tab"
              aria-selected={isTabActive(id)}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-oxford-blue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-tabiya-green'
                    : 'text-text-muted hover:text-oxford-blue'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
