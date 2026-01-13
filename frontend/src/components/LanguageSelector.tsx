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
  en: '🇬🇧',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  ru: '🇷🇺',
  zh: '🇨🇳',
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
      style={{ position: 'relative', display: 'inline-block' }}
    >
      
      {}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn secondary"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          minHeight: '40px'
        }}
        aria-label="Select Language"
      >
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{currentLang.flag}</span>
        <span style={{ textTransform: 'uppercase', fontSize: '0.9rem' }}>{currentLang.code}</span>
        
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
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)'
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--space-2)',
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            minWidth: '180px',
            overflow: 'hidden',
            animation: 'fadeInPage 0.2s ease-out'
          }}
        >
          <div style={{ padding: 'var(--space-1)' }}>
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: 'none',
                    background: isActive ? 'var(--color-bg-element)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-element)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <span style={{ textTransform: 'capitalize' }}>{lang.label}</span>
                  
                  {isActive && (
                    <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>
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