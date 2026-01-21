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
    <div 
      ref={dropdownRef} 
      className="relative inline-block"
    >
      
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 min-h-[40px] bg-[var(--color-bg-element)] text-[var(--color-text-main)] rounded-md border border-transparent hover:bg-[var(--color-border)] transition-colors"
        aria-label="Select Language"
      >
        <span className="text-xl leading-none">{currentLang.flag}</span>
        <span className="uppercase text-sm font-medium">{currentLang.code}</span>
        
        {}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md shadow-lg z-50 min-w-[180px] overflow-hidden animate-fade-in"
        >
          <div className="p-1">
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 text-left cursor-pointer text-sm rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--color-bg-element)] text-[var(--color-primary)]'
                        : 'bg-transparent text-[var(--color-text-main)] hover:bg-[var(--color-bg-element)]'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="capitalize">{lang.label}</span>
                  
                  {isActive && (
                    <span className="ml-auto text-[var(--color-primary)]">✓</span>
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
