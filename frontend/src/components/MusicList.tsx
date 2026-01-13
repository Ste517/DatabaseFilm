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
      <table>
        <thead>
          <tr>
            <th>Artista</th>
            <th>Titolo</th>
            <th>Anno</th>
            <th>Rating</th>
            <th>Posizione</th>
            <th>Media</th>
          </tr>
        </thead>
        <tbody>
          {music.map((item) => (
            <tr key={item.id} onClick={() => onItemClick(item)} style={{ cursor: 'pointer' }}>
              <td>{item.artista}</td>
              <td>
                  {item.titolo}
                  {userVotes[`musica_${item.id}`] && (
                      <span style={{ marginLeft: '8px', fontSize: '0.8em', color: 'var(--color-primary)' }}>
                          ({t('YourVote')}: {userVotes[`musica_${item.id}`]})
                      </span>
                  )}
              </td>
              <td>{item.anno_uscita}</td>
              <td>
                {item.media_rating ? (
                  <span style={getVoteBadgeStyle(item.media_rating)}>
                    {item.media_rating.toFixed(1)}
                  </span>
                ) : '-'}
              </td>
              <td>{item.posizione_fisica}</td>
              <td>{item.media_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="grid-container">
      {music.map((item) => (
        <div key={item.id} className="grid-card" onClick={() => onItemClick(item)} style={{ cursor: 'pointer' }}>
          {item.copertina ? (
            <img src={item.copertina} alt={item.titolo} style={{ aspectRatio: '1/1' }} />
          ) : (
            <div style={{ aspectRatio: '1/1', backgroundColor: 'var(--color-bg-element)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>No Cover</span>
            </div>
          )}
          <div className="grid-card-content">
            <div className="grid-card-title" title={item.titolo}>{item.titolo}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{item.artista}</div>

            {userVotes[`musica_${item.id}`] && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '4px' }}>
                    {t('YourVote')}: {userVotes[`musica_${item.id}`]}
                </div>
            )}

             <div className="flex justify-between items-center text-sm text-muted">
              <span>{item.anno_uscita}</span>
              {item.media_rating && (
                 <span style={getVoteBadgeStyle(item.media_rating)}>
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
