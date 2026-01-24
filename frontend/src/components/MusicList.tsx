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
      <div className="w-full overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 border-b border-[var(--border-color)]">Artista</th>
              <th className="p-3 border-b border-[var(--border-color)]">Titolo</th>
              <th className="p-3 border-b border-[var(--border-color)]">Anno</th>
              <th className="p-3 border-b border-[var(--border-color)]">Rating</th>
              <th className="p-3 border-b border-[var(--border-color)]">Posizione</th>
              <th className="p-3 border-b border-[var(--border-color)]">Media</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {music.map((item) => (
              <tr
                key={item.id}
                onClick={() => onItemClick(item)}
                className="hover:bg-[var(--bg-hover)] cursor-pointer transition-colors text-[var(--text-primary)]"
              >
                <td className="p-3 font-medium">{item.artista}</td>
                <td className="p-3">
                    {item.titolo}
                    {userVotes[`musica_${item.id}`] && (
                        <span className="ml-2 text-xs text-[var(--primary-color)]">
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
            className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden hover:border-[var(--primary-color)] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onItemClick(item)}
        >
          <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-secondary)]">
            {item.copertina ? (
                <img
                    src={item.copertina}
                    alt={item.titolo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                    <span>No Cover</span>
                </div>
            )}
          </div>

          <div className="p-3 flex flex-col gap-1 flex-grow">
            <div className="font-semibold text-[var(--text-primary)] truncate" title={item.titolo}>
                {item.titolo}
            </div>
            <div className="text-sm text-[var(--text-muted)] truncate">
                {item.artista}
            </div>

            {userVotes[`musica_${item.id}`] && (
                <div className="text-xs text-[var(--primary-color)] mb-1">
                    {t('YourVote')}: {userVotes[`musica_${item.id}`]}
                </div>
            )}

            <div className="flex justify-between items-center text-sm text-[var(--text-muted)] mt-auto pt-2">
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
