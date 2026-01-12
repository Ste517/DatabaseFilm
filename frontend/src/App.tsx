import { useState, useEffect } from 'react';
import './App.css';
import api from './api/axios';
import type { Film, Musica } from './types';
import FilmList from './components/FilmList';
import MusicList from './components/MusicList';

function App() {
  const [activeTab, setActiveTab] = useState<'movies' | 'music'>('movies');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [films, setFilms] = useState<Film[]>([]);
  const [music, setMusic] = useState<Musica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'movies') {
          const response = await api.get('films/');
          setFilms(response.data.results || response.data);
        } else {
          const response = await api.get('musica/');
          setMusic(response.data.results || response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">My Media Site</div>
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
        <button className="theme-toggle" aria-label="Toggle theme">
          {/* Placeholder for theme icon logic */}
          <span>◐</span>
        </button>
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
              <FilmList films={films} viewMode={viewMode} />
            ) : (
              <MusicList music={music} viewMode={viewMode} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
