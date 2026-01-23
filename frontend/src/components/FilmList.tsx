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
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-800 text-zinc-300 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 border-b border-zinc-700">Titolo</th>
              <th className="p-3 border-b border-zinc-700">Anno</th>
              <th className="p-3 border-b border-zinc-700">Rating</th>
              <th className="p-3 border-b border-zinc-700">Posizione</th>
              <th className="p-3 border-b border-zinc-700">Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {films.map((film) => (
              <tr
                key={film.id}
                onClick={() => onItemClick(film)}
                className="hover:bg-zinc-800/50 cursor-pointer transition-colors text-zinc-100"
              >
                <td className="p-3">
                    {film.titolo}
                    {userVotes[`film_${film.id}`] && (
                        <span className="ml-2 text-xs text-sky-500">
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
            className="group bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden hover:border-sky-500 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onItemClick(film)}
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
            {film.poster ? (
                <img
                    src={film.poster}
                    alt={film.titolo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                    <span>No Poster</span>
                </div>
            )}
          </div>

          <div className="p-3 flex flex-col gap-2 flex-grow">
            <div className="font-semibold text-zinc-100 truncate" title={film.titolo}>
                {film.titolo}
            </div>

            {userVotes[`film_${film.id}`] && (
                <div className="text-xs text-sky-500 mb-1">
                    {t('YourVote')}: {userVotes[`film_${film.id}`]}
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-zinc-400 mt-auto">
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
