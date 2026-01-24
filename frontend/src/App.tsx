import { useState, useEffect } from 'react';
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

  // Set page title
  useEffect(() => {
      document.title = t('MovieCatalogue');
  }, [t]);

  const fetchVotes = async () => {
      try {
          const response = await api.get('voti/');
          const votesList = response.data.results || response.data;
          const votesMap: Record<string, number> = {};
          votesList.forEach((v: any) => {
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
        fetchVotes();
        return;
    }

    try {
      setLoading(true);
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors duration-300">
        <div className="text-xl font-bold text-[var(--primary-color)] whitespace-nowrap">{t('MovieCatalogue')}</div>

        <div className="flex-1 max-w-md mx-auto order-3 md:order-2 w-full md:w-auto">
            <input
                type="text"
                placeholder={t('Search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
            />
        </div>

        <div className="flex items-center gap-6 order-2 md:order-3">
            <div className="hidden md:flex gap-6">
              <a
                href="#"
                className={`font-medium hover:text-[var(--primary-color)] transition-colors ${activeTab === 'movies' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('movies'); }}
              >
                {t('Movies')}
              </a>
              <a
                href="#"
                className={`font-medium hover:text-[var(--primary-color)] transition-colors ${activeTab === 'music' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('music'); }}
              >
                {t('Music')}
              </a>
              <a
                href="#"
                className={`font-medium hover:text-[var(--primary-color)] transition-colors ${activeTab === 'profile' ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)]'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}
              >
                {t('Profile')}
              </a>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)]">
                <LanguageSelector />

                <button
                    onClick={toggleTheme}
                    aria-label={t('Theme')}
                    className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                >
                 {theme === 'dark' ? (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                 ) : (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                 )}
                </button>
                <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md transition-colors"
                >
                    {t('Logout')}
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] w-full mx-auto px-4 mt-8 flex-grow pb-12">
        {activeTab === 'profile' ? (
            <Profile />
        ) : (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                    {activeTab === 'movies' ? t('Movies') : t('Music')}
                </h1>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
                        <label className="text-sm text-[var(--text-muted)] pl-2">{t('SortBy')}:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-[var(--text-primary)] text-sm py-1 pr-8 focus:outline-none cursor-pointer"
                        >
                            <option value="-id" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Default</option>
                            <option value="titolo" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Title')} &uarr;</option>
                            <option value="-titolo" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Title')} &darr;</option>
                            <option value="anno_uscita" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Year')} &uarr;</option>
                            <option value="-anno_uscita" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Year')} &darr;</option>
                            <option value="media_rating" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Rating')} &uarr;</option>
                            <option value="-media_rating" className="bg-[var(--bg-card)] text-[var(--text-primary)]">{t('Rating')} &darr;</option>
                        </select>
                    </div>

                    <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
                        <button
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setViewMode('grid')}
                        >
                        {t('Grid')}
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            onClick={() => setViewMode('list')}
                        >
                        {t('List')}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="text-[var(--text-muted)] animate-pulse">Loading...</div>
            </div>
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
