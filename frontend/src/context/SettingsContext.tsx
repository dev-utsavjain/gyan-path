import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSettings, type Settings } from '../api/settings';

// Code-default fallbacks — mirror the backend seed so the site renders fully
// even before /v1/settings resolves or if a key is missing.
export const DEFAULT_SETTINGS: Settings = {
  contact_phone: '+91 7974889250',
  contact_phone_raw: '917974889250',
  contact_email: 'info@gyaanpathdigital.in',
  contact_address: 'Anand kunj garha, jabalpur, Madhya Pradesh, 482003',
  hero_title: 'Learn Skills, Build Careers, Create Opportunities',
  hero_subtitle: 'Join our Daily Live Interactive Program and upgrade your skills for a better career and life.',
  footer_tagline: 'Learn Skills, Build Careers, Create Opportunities. Join our daily live program and take the right step towards a better future.',
  plan_basic_name: 'GyaanPath Digital Career Development Program',
  plan_basic_price: '399',
  plan_basic_blurb: 'Gain full access to all 15 comprehensive lifestyle and skill development courses. Transform your future today.',
  plan_additional_name: 'Additional Support - Full Access',
  plan_additional_price: '399',
  plan_additional_blurb: 'Unlock 7 vital support services including legal, medical, and career guidance. We stand exclusively with you.',
  plan_upcoming_blurb: 'Prepare yourself for our next wave of comprehensive courses coming soon.',
  plan_upcoming_price: '499',
};

interface SettingsContextValue {
  get: (key: string) => string;
  num: (key: string) => number;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  get: (k) => DEFAULT_SETTINGS[k] ?? '',
  num: (k) => Number(DEFAULT_SETTINGS[k] ?? 0) || 0,
  loaded: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSettings()
      .then((s) => {
        if (alive) setSettings({ ...DEFAULT_SETTINGS, ...s });
      })
      .catch(() => {
        /* keep defaults on failure */
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const get = (key: string) => settings[key] ?? DEFAULT_SETTINGS[key] ?? '';
  const num = (key: string) => {
    const n = Number(get(key));
    return Number.isFinite(n) ? n : 0;
  };

  return <SettingsContext.Provider value={{ get, num, loaded }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
