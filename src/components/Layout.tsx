import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import Footer from './Footer';
import { useAppStore } from '@/store';
import type { Language } from '@/types';

export default function Layout() {
  const { lang } = useParams<{ lang: string }>();
  const setLanguage = useAppStore((state) => state.setLanguage);

  // Sync language from URL to store
  useEffect(() => {
    if (lang === 'en' || lang === 'es') {
      setLanguage(lang as Language);
    }
  }, [lang, setLanguage]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
