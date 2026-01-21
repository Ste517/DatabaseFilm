import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Automatically import all json files from ./locales
const modules = import.meta.glob('./locales/*.json', { eager: true });

const resources: any = {};

for (const path in modules) {
  // Extract language code from filename (e.g., ./locales/en.json -> en)
  const match = path.match(/\/([a-z]{2})\.json$/);
  if (match) {
    const lang = match[1];
    resources[lang] = (modules[path] as any).default || modules[path];
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
