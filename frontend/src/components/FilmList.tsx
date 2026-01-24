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
      <div className="w-full overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 border-b border-[var(--border-color)]">Titolo</th>
              <th className="p-3 border-b border-[var(--border-color)]">Anno</th>
              <th className="p-3 border-b border-[var(--border-color)]">Rating</th>
              <th className="p-3 border-b border-[var(--border-color)]">Posizione</th>
              <th className="p-3 border-b border-[var(--border-color)]">Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {films.map((film) => (
              <tr
                key={film.id}
                onClick={() => onItemClick(film)}
                className="hover:bg-[var(--bg-hover)] cursor-pointer transition-colors text-[var(--text-primary)]"
              >
                <td className="p-3">
                    {film.titolo}
                    {userVotes[`film_${film.id}`] && (
                        <span className="ml-2 text-xs text-[var(--primary-color)]">
                            ({t('YourVote')}: {userVotes[`film_${film.id}`]})
                        </span>
                    )}
                </td>
                <td className="p-3">{film.anno_uscita}</td>
                <td className="p-3">
                  {film.media_rating ? (
                    <span {...getVoteBadgeStyle(film.media_rating)}>
                      {film.media_rating.toFixed(1)}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-3">{film.posizione_fisica}</td>
                <td className="p-3">{film.media_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 p-4">
      {films.map((film) => (
        <div
            key={film.id}
            className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden hover:border-[var(--primary-color)] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onItemClick(film)}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--bg-secondary)]">
            {film.poster ? (
                <img
                    src={film.poster}
                    alt={film.titolo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                    <span>No Poster</span>
                </div>
            )}
          </div>

          <div className="p-3 flex flex-col gap-2 flex-grow">
            <div className="font-semibold text-[var(--text-primary)] truncate" title={film.titolo}>
                {film.titolo}
            </div>

            {userVotes[`film_${film.id}`] && (
                <div className="text-xs text-[var(--primary-color)] mb-1">
                    {t('YourVote')}: {userVotes[`film_${film.id}`]}
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-[var(--text-muted)] mt-auto">
              <span>{film.anno_uscita}</span>
              {film.media_rating && (
                 <span {...getVoteBadgeStyle(film.media_rating)}>
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
