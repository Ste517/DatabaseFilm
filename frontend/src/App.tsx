import { useState, useEffect } from 'react';
import './App.css';
import './AppOverrides.css';
import api from './api/axios';
import type { Film, Musica } from './types';
import FilmList from './components/FilmList';
import MusicList from './components/MusicList';
import Login from './components/Login';
import DetailModal from './components/DetailModal';
import Profile from './components/Profile';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState<'movies' | 'music' | 'profile'>('movies');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('-id');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [films, setFilms] = useState<Film[]>([]);
  const [music, setMusic] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

  // Store user votes mapping: ItemID -> VoteValue
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Film | Musica | null>(null);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  <LanguageSelector />;

  document.title = t('MovieCatalogue');

  const fetchVotes = async () => {
      try {
          const response = await api.get('voti/');
          const votesList = response.data.results || response.data;
          const votesMap: Record<string, number> = {};
          votesList.forEach((v: any) => {
              // Create unique keys for films vs music to avoid collision if IDs overlap
              if (v.film) votesMap[`film_${v.film}`] = v.valore;
              if (v.musica) votesMap[`musica_${v.musica}`] = v.valore;
          });
          setUserVotes(votesMap);
      } catch (e) {
          console.error("Error fetching votes", e);
      }
  };

  const fetchData = async () => {
    if (activeTab === 'profile') {
        // Just refresh votes if we are on profile, though Profile component handles its own fetch usually
        // But we want to keep app state in sync
        fetchVotes();
        return;
    }

    try {
      setLoading(true);

      // Fetch votes in parallel
      fetchVotes();

      const endpoint = activeTab === 'movies' ? 'films/' : 'musica/';
      const params: any = { ordering: sortBy };

      if (searchQuery) {
          params.search = searchQuery;
      }

      const response = await api.get(endpoint, { params });
      if (activeTab === 'movies') {
        setFilms(response.data.results || response.data);
      } else {
        setMusic(response.data.results || response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [activeTab, isAuthenticated, searchQuery, sortBy]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const MobileLink = ({ tab, label }: { tab: 'movies' | 'music' | 'profile', label: string }) => (
    <button
      className={`w-full text-left py-2 px-4 rounded-md transition-colors ${activeTab === tab ? 'bg-[var(--color-bg-element)] text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-main)] hover:bg-[var(--color-bg-element)]'}`}
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="App min-h-screen bg-[var(--color-bg-body)] text-[var(--color-text-main)] font-sans">
      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 flex items-center justify-between h-16 px-4 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">

        {/* Mobile Hamburger */}
        <button
          className="md:hidden mr-4 text-[var(--color-text-main)] focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="nav-brand font-bold text-lg text-[var(--color-primary)] mr-auto md:mr-0">{t('MovieCatalogue')}</div>

        <div className="search-container flex-1 mx-4 max-w-[400px] hidden md:block">
            <input
                type="text"
                placeholder={t('Search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
        </div>

        <div className="nav-links hidden md:flex gap-6 items-center">
          <a
            href="#"
            className={`font-medium hover:text-[var(--color-primary)] ${activeTab === 'movies' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}
            onClick={() => setActiveTab('movies')}
          >
            {t('Movies')}
          </a>
          <a
            href="#"
            className={`font-medium hover:text-[var(--color-primary)] ${activeTab === 'music' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}
            onClick={() => setActiveTab('music')}
          >
            {t('Music')}
          </a>
          <a
            href="#"
            className={`font-medium hover:text-[var(--color-primary)] ${activeTab === 'profile' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}
            onClick={() => setActiveTab('profile')}
          >
            {t('Profile')}
          </a>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-4">
            <div className="hidden md:block">
               <LanguageSelector />
            </div>

            <button className="theme-toggle p-2 rounded-full hover:bg-[var(--color-bg-element)] text-[var(--color-text-main)] hover:text-[var(--color-primary)]" onClick={toggleTheme} aria-label={t('Theme')}>
             {theme === 'dark' ? (
                <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
             ) : (
                <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
             )}
            </button>
            <button className="btn secondary text-sm px-3 py-1 min-h-0 bg-[var(--color-bg-element)] text-[var(--color-text-main)] hover:bg-[var(--color-border)] rounded-md hidden md:block" onClick={handleLogout}>
                {t('Logout')}
            </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] p-4 z-40 shadow-lg animate-fade-in">
           <div className="mb-4">
              <input
                  type="text"
                  placeholder={t('Search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)]"
              />
           </div>

           <div className="flex flex-col gap-2 mb-4">
              <MobileLink tab="movies" label={t('Movies')} />
              <MobileLink tab="music" label={t('Music')} />
              <MobileLink tab="profile" label={t('Profile')} />
           </div>

           <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-4">
              <LanguageSelector />
              <button className="text-[var(--color-danger)] font-medium" onClick={handleLogout}>
                  {t('Logout')}
              </button>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8 max-w-[1200px]">
        {activeTab === 'profile' ? (
            <Profile />
        ) : (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold mb-0">{activeTab === 'movies' ? t('Movies') : t('Music')}</h1>

            <div className="flex gap-4 items-center flex-wrap w-full md:w-auto">
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <label className="whitespace-nowrap">{t('SortBy')}:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] w-full md:w-auto"
                    >
                        <option value="-id">Default</option>
                        <option value="titolo">{t('Title')} &uarr;</option>
                        <option value="-titolo">{t('Title')} &darr;</option>
                        <option value="anno_uscita">{t('Year')} &uarr;</option>
                        <option value="-anno_uscita">{t('Year')} &darr;</option>
                        <option value="media_rating">{t('Rating')} &uarr;</option>
                        <option value="-media_rating">{t('Rating')} &darr;</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-element)] text-[var(--color-text-main)] hover:bg-[var(--color-border)]'}`}
                    onClick={() => setViewMode('grid')}
                    >
                    {t('Grid')}
                    </button>
                    <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-element)] text-[var(--color-text-main)] hover:bg-[var(--color-border)]'}`}
                    onClick={() => setViewMode('list')}
                    >
                    {t('List')}
                    </button>
                </div>
            </div>
            </div>

            {loading ? (
            <div className="text-center p-8">Loading...</div>
            ) : (
            <>
                {activeTab === 'movies' ? (
                <FilmList
                    films={films}
                    viewMode={viewMode}
                    userVotes={userVotes}
                    onItemClick={(item) => setSelectedItem(item)}
                />
                ) : (
                <MusicList
                    music={music}
                    viewMode={viewMode}
                    userVotes={userVotes}
                    onItemClick={(item) => setSelectedItem(item)}
                />
                )}
            </>
            )}
        </>
        )}
      </main>

      {/* Modal */}
      {selectedItem && (
        <DetailModal
            item={selectedItem}
            type={activeTab === 'movies' ? 'film' : 'musica'}
            onClose={() => setSelectedItem(null)}
            onVoteSuccess={fetchData}
        />
      )}
    </div>
  );
}

export default App;
