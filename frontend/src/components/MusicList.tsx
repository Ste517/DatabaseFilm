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
      <div className="w-full overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--color-bg-element)] text-[var(--color-text-main)]">
            <tr>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Artista</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Titolo</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Anno</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold">Rating</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold hidden md:table-cell">Posizione</th>
              <th className="p-3 border-b border-[var(--color-border)] font-semibold hidden md:table-cell">Media</th>
            </tr>
          </thead>
          <tbody>
            {music.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onItemClick(item)}
                className={`cursor-pointer hover:bg-[var(--color-bg-element)] transition-colors ${index % 2 === 1 ? 'bg-[var(--color-bg-body)]/50' : ''}`}
              >
                <td className="p-3 border-b border-[var(--color-border)]">{item.artista}</td>
                <td className="p-3 border-b border-[var(--color-border)]">
                    <span className="font-medium">{item.titolo}</span>
                    {userVotes[`musica_${item.id}`] && (
                        <span className="ml-2 text-xs text-[var(--color-primary)]">
                            ({t('YourVote')}: {userVotes[`musica_${item.id}`]})
                        </span>
                    )}
                </td>
                <td className="p-3 border-b border-[var(--color-border)]">{item.anno_uscita}</td>
                <td className="p-3 border-b border-[var(--color-border)]">
                  {item.media_rating ? (
                    <span style={getVoteBadgeStyle(item.media_rating)} className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold">
                      {item.media_rating.toFixed(1)}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-3 border-b border-[var(--color-border)] hidden md:table-cell">{item.posizione_fisica}</td>
                <td className="p-3 border-b border-[var(--color-border)] hidden md:table-cell">{item.media_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-4">
      {music.map((item) => (
        <div
          key={item.id}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[var(--color-primary)]"
          onClick={() => onItemClick(item)}
        >
          <div className="relative aspect-square">
            {item.copertina ? (
              <img src={item.copertina} alt={item.titolo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--color-bg-element)] flex items-center justify-center text-[var(--color-text-muted)]">
                <span>No Cover</span>
              </div>
            )}
            {userVotes[`musica_${item.id}`] && (
                <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                    {userVotes[`musica_${item.id}`]}
                </div>
            )}
          </div>
          <div className="p-3">
            <div className="font-semibold text-sm md:text-base truncate mb-1" title={item.titolo}>{item.titolo}</div>
            <div className="text-xs text-[var(--color-text-muted)] truncate mb-2">{item.artista}</div>

             <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
              <span>{item.anno_uscita}</span>
              {item.media_rating && (
                 <span style={getVoteBadgeStyle(item.media_rating)} className="px-1.5 py-0.5 rounded font-bold text-white">
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
