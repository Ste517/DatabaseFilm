import { useState, useEffect } from 'react';
import './App.css';
import api from './api/axios';
import type { Film, Musica } from './types';
import FilmList from './components/FilmList';
import MusicList from './components/MusicList';
import Login from './components/Login';
import DetailModal from './components/DetailModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState<'movies' | 'music'>('movies');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  const [films, setFilms] = useState<Film[]>([]);
  const [music, setMusic] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'movies' ? 'films/' : 'musica/';
      const params: any = {};

      // Basic client-side filtering support via API search parameter if supported
      // The backend supports ?search=...
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
  }, [activeTab, isAuthenticated, searchQuery]); // Re-fetch on tab, auth, or search change

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

        {/* Search Bar - Only show on desktop for now or make responsive */}
        <div className="search-container" style={{ flex: 1, margin: '0 2rem', maxWidth: '400px' }}>
            <input
                type="text"
                placeholder="Cerca..."
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
            Movies
          </a>
          <a
            href="#"
            className={activeTab === 'music' ? 'active' : ''}
            onClick={() => setActiveTab('music')}
          >
            Music
          </a>
        </div>

        <div className="flex items-center gap-4" style={{ marginLeft: '1rem' }}>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
             {theme === 'dark' ? (
                // Sun Icon
                <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
             ) : (
                // Moon Icon
                <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
             )}
            </button>
            <button className="btn secondary" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', minHeight: 'auto' }}>
                Logout
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h1>{activeTab === 'movies' ? 'Film Catalog' : 'Music Collection'}</h1>

          <div className="flex gap-2">
            <button
              className={`btn ${viewMode === 'grid' ? '' : 'secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`btn ${viewMode === 'list' ? '' : 'secondary'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
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
                onItemClick={(item) => setSelectedItem(item)}
              />
            ) : (
              <MusicList
                music={music}
                viewMode={viewMode}
                onItemClick={(item) => setSelectedItem(item)}
              />
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
