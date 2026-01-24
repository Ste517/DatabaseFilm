import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// --- TIPI ---
interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

// --- CONFIGURAZIONE ---
const FLAGS: Record<string, string> = {
  en: 'US',
  it: 'IT',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
  ru: 'RU',
  zh: 'CN',
  la: 'LA',
  el: 'EL',
};

const getNativeName = (code: string): string => {
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code) || code;
  } catch (error) {
    return code.toUpperCase();
  }
};

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = useMemo<LanguageOption[]>(() => {
    const files = import.meta.glob('../locales/*.json', { eager: true });
    
    return Object.keys(files).map((path) => {
      const match = path.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\.json$/);
      const code = match ? match[1] : 'en'; 
      return {
        code,
        label: getNativeName(code),
        flag: FLAGS[code] || '🌍',
      };
    });
  }, []);

  // Chiusura al click esterno
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === i18n.language) || { flag: '🌍', code: i18n.language, label: i18n.language };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
        aria-label="Select Language"
      >
        <span className="text-xl leading-none">{currentLang.flag}</span>
        <span className="text-sm uppercase font-medium">{currentLang.code}</span>
        
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors
                    ${isActive
                      ? 'bg-[var(--bg-hover)] text-[var(--primary-color)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  <span className="text-xl leading-none">{lang.flag}</span>
                  <span className="capitalize">{lang.label}</span>
                  
                  {isActive && (
                    <span className="ml-auto text-[var(--primary-color)]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
