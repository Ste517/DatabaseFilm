import React from 'react';
import type { Musica } from '../types';
import { useTranslation } from 'react-i18next';
import { getVoteBadgeStyle } from '../utils/styleUtils';

interface MusicListProps {
  music: Musica[];
  viewMode: 'grid' | 'list';
  userVotes: Record<string, number>;
  onItemClick: (item: Musica) => void;
}

const MusicList: React.FC<MusicListProps> = ({ music, viewMode, userVotes, onItemClick }) => {
  const { t } = useTranslation();

  if (viewMode === 'list') {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-800 text-zinc-300 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 border-b border-zinc-700">Artista</th>
              <th className="p-3 border-b border-zinc-700">Titolo</th>
              <th className="p-3 border-b border-zinc-700">Anno</th>
              <th className="p-3 border-b border-zinc-700">Rating</th>
              <th className="p-3 border-b border-zinc-700">Posizione</th>
              <th className="p-3 border-b border-zinc-700">Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {music.map((item) => (
              <tr
                key={item.id}
                onClick={() => onItemClick(item)}
                className="hover:bg-zinc-800/50 cursor-pointer transition-colors text-zinc-100"
              >
                <td className="p-3 font-medium">{item.artista}</td>
                <td className="p-3">
                    {item.titolo}
                    {userVotes[`musica_${item.id}`] && (
                        <span className="ml-2 text-xs text-sky-500">
                            ({t('YourVote')}: {userVotes[`musica_${item.id}`]})
                        </span>
                    )}
                </td>
                <td className="p-3">{item.anno_uscita}</td>
                <td className="p-3">
                  {item.media_rating ? (
                    <span {...getVoteBadgeStyle(item.media_rating)}>
                      {item.media_rating.toFixed(1)}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-3">{item.posizione_fisica}</td>
                <td className="p-3">{item.media_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 p-4">
      {music.map((item) => (
        <div
            key={item.id}
            className="group bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden hover:border-sky-500 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onItemClick(item)}
        >
          <div className="relative aspect-square w-full overflow-hidden bg-zinc-800">
            {item.copertina ? (
                <img
                    src={item.copertina}
                    alt={item.titolo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                    <span>No Cover</span>
                </div>
            )}
          </div>

          <div className="p-3 flex flex-col gap-1 flex-grow">
            <div className="font-semibold text-zinc-100 truncate" title={item.titolo}>
                {item.titolo}
            </div>
            <div className="text-sm text-zinc-400 truncate">
                {item.artista}
            </div>

            {userVotes[`musica_${item.id}`] && (
                <div className="text-xs text-sky-500 mb-1">
                    {t('YourVote')}: {userVotes[`musica_${item.id}`]}
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-zinc-400 mt-auto pt-2">
              <span>{item.anno_uscita}</span>
              {item.media_rating && (
                 <span {...getVoteBadgeStyle(item.media_rating)}>
                    {item.media_rating.toFixed(1)}
                 </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MusicList;
