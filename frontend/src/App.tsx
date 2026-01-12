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
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'it' : 'en';
    i18n.changeLanguage(newLang);
  };

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

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">My Media Site</div>

        <div className="search-container" style={{ flex: 1, margin: '0 2rem', maxWidth: '400px' }}>
            <input
                type="text"
                placeholder={t('Search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: '20px' }}
            />
        </div>

        <div className="nav-links">
          <a
            href="#"
            className={activeTab === 'movies' ? 'active' : ''}
            onClick={() => setActiveTab('movies')}
          >
            {t('Movies')}
          </a>
          <a
            href="#"
            className={activeTab === 'music' ? 'active' : ''}
            onClick={() => setActiveTab('music')}
          >
            {t('Music')}
          </a>
          <a
            href="#"
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            {t('Profile')}
          </a>
        </div>

        <div className="flex items-center gap-4" style={{ marginLeft: '1rem' }}>
             <button className="btn secondary" onClick={toggleLanguage} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', minHeight: 'auto' }}>
                {i18n.language.toUpperCase()}
            </button>

            <button className="theme-toggle" onClick={toggleTheme} aria-label={t('Theme')}>
             {theme === 'dark' ? (
                <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
             ) : (
                <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
             )}
            </button>
            <button className="btn secondary" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', minHeight: 'auto' }}>
                {t('Logout')}
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '2rem' }}>
        {activeTab === 'profile' ? (
            <Profile />
        ) : (
        <>
            <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1rem' }}>
            <h1>{activeTab === 'movies' ? t('Movies') : t('Music')}</h1>

            <div className="flex gap-4 items-center flex-wrap">
                <div className="flex items-center gap-2">
                    <label>{t('SortBy')}:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="-id">Default</option>
                        <option value="titolo">{t('Title')}</option>
                        <option value="-anno_uscita">{t('Year')}</option>
                        <option value="-media_rating">{t('Rating')}</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                    className={`btn ${viewMode === 'grid' ? '' : 'secondary'}`}
                    onClick={() => setViewMode('grid')}
                    >
                    {t('Grid')}
                    </button>
                    <button
                    className={`btn ${viewMode === 'list' ? '' : 'secondary'}`}
                    onClick={() => setViewMode('list')}
                    >
                    {t('List')}
                    </button>
                </div>
            </div>
            </div>

            {loading ? (
            <div className="text-center" style={{ padding: '2rem' }}>Loading...</div>
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
