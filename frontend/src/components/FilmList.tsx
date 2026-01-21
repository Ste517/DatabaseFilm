import React from 'react';
import type { Film } from '../types';
import { useTranslation } from 'react-i18next';
import { getVoteBadgeStyle } from '../utils/styleUtils';

interface FilmListProps {
  films: Film[];
  viewMode: 'grid' | 'list';
  userVotes: Record<string, number>;
  onItemClick: (item: Film) => void;
}

const FilmList: React.FC<FilmListProps> = ({ films, viewMode, userVotes, onItemClick }) => {
  const { t } = useTranslation();

  if (viewMode === 'list') {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--color-bg-element)] text-[var(--color-text-main)]">
            <tr>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Titolo</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Anno</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Rating</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold hidden md:table-cell">Posizione</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold hidden md:table-cell">Media</th>
            </tr>
          </thead>
          <tbody>
            {films.map((film, index) => (
              <tr
                key={film.id}
                onClick={() => onItemClick(film)}
                className={`cursor-pointer hover:bg-[var(--color-bg-element)] transition-colors ${index % 2 === 1 ? 'bg-[var(--color-bg-body)]/50' : ''}`}
              >
                <td className="p-3 border-b border-[var(--color-border)]">
                    <span className="font-medium">{film.titolo}</span>
                    {userVotes[`film_${film.id}`] && (
                        <span className="ml-2 text-xs text-[var(--color-primary)]">
                            ({t('YourVote')}: {userVotes[`film_${film.id}`]})
                        </span>
                    )}
                </td>
                <td className="p-3 border-b border-[var(--color-border)]">{film.anno_uscita}</td>
                <td className="p-3 border-b border-[var(--color-border)]">
                  {film.media_rating ? (
                    <span style={getVoteBadgeStyle(film.media_rating)} className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold">
                      {film.media_rating.toFixed(1)}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-3 border-b border-[var(--color-border)] hidden md:table-cell">{film.posizione_fisica}</td>
                <td className="p-3 border-b border-[var(--color-border)] hidden md:table-cell">{film.media_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-4">
      {films.map((film) => (
        <div
          key={film.id}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[var(--color-primary)]"
          onClick={() => onItemClick(film)}
        >
          <div className="relative aspect-[2/3]">
            {film.poster ? (
              <img src={film.poster} alt={film.titolo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--color-bg-element)] flex items-center justify-center text-[var(--color-text-muted)]">
                <span>No Poster</span>
              </div>
            )}
            {userVotes[`film_${film.id}`] && (
                <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                    {userVotes[`film_${film.id}`]}
                </div>
            )}
          </div>

          <div className="p-3">
            <div className="font-semibold text-sm md:text-base truncate mb-1" title={film.titolo}>{film.titolo}</div>

            <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
              <span>{film.anno_uscita}</span>
              {film.media_rating && (
                 <span style={getVoteBadgeStyle(film.media_rating)} className="px-1.5 py-0.5 rounded font-bold text-white">
                    {film.media_rating.toFixed(1)}
                 </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilmList;
