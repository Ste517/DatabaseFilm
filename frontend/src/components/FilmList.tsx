import React from 'react';
import type { Film } from '../types';

interface FilmListProps {
  films: Film[];
  viewMode: 'grid' | 'list';
  onItemClick: (item: Film) => void;
}

const FilmList: React.FC<FilmListProps> = ({ films, viewMode, onItemClick }) => {
  if (viewMode === 'list') {
    return (
      <table>
        <thead>
          <tr>
            <th>Titolo</th>
            <th>Anno</th>
            <th>Rating</th>
            <th>Posizione</th>
            <th>Media</th>
          </tr>
        </thead>
        <tbody>
          {films.map((film) => (
            <tr key={film.id} onClick={() => onItemClick(film)} style={{ cursor: 'pointer' }}>
              <td>{film.titolo}</td>
              <td>{film.anno_uscita}</td>
              <td>
                {film.media_rating ? (
                  <span className={`badge-voto ${
                    film.media_rating >= 8 ? 'voto-ottimo' :
                    film.media_rating >= 6 ? 'voto-buono' :
                    film.media_rating >= 4 ? 'voto-medio' :
                    'voto-scarso'
                  }`}>
                    {film.media_rating.toFixed(1)}
                  </span>
                ) : '-'}
              </td>
              <td>{film.posizione_fisica}</td>
              <td>{film.media_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="grid-container">
      {films.map((film) => (
        <div key={film.id} className="grid-card" onClick={() => onItemClick(film)} style={{ cursor: 'pointer' }}>
          {film.poster ? (
            <img src={film.poster} alt={film.titolo} />
          ) : (
            <div style={{ aspectRatio: '2/3', backgroundColor: 'var(--color-bg-element)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>No Poster</span>
            </div>
          )}
          <div className="grid-card-content">
            <div className="grid-card-title" title={film.titolo}>{film.titolo}</div>
            <div className="flex justify-between items-center text-sm text-muted">
              <span>{film.anno_uscita}</span>
              {film.media_rating && (
                 <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>★ {film.media_rating.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilmList;
