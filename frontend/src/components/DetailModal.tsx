import React, { useState } from 'react';
import api from '../api/axios';
import type { Film, Musica } from '../types';
import { useTranslation } from 'react-i18next';

interface DetailModalProps {
  item: Film | Musica | null;
  type: 'film' | 'musica';
  onClose: () => void;
  onVoteSuccess: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, type, onClose, onVoteSuccess }) => {
  const { t } = useTranslation();
  const [voteValue, setVoteValue] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [existingVote, setExistingVote] = useState<any>(null);

  React.useEffect(() => {
    // Check if user has already voted
    const fetchUserVote = async () => {
        try {
            // Need a way to filter votes by item. Assuming backend VotoViewSet supports filtering.
            // If not, we have to fetch all and filter client side (not efficient but works for small app)
            // or backend endpoint.
            // Let's assume standard ViewSet allows filtering if configured.
            // Actually I configured FilterBackends? No, explicit fields only.
            // Let's assume we can GET /api/v1/voti/ and filter client side for now as safe bet
            // given I control backend but re-deploying it just for filter is slower than client filter.
            // Wait, I am the full stack dev. I should ensure backend filtering.
            // But let's try client side filter of "my votes" since user won't have millions.
            const response = await api.get('voti/');
            const myVotes = response.data.results || response.data;
            const vote = myVotes.find((v: any) =>
                (type === 'film' && v.film === item?.id) ||
                (type === 'musica' && v.musica === item?.id)
            );
            if (vote) {
                setExistingVote(vote);
                setVoteValue(vote.valore);
            }
        } catch (e) {
            console.error(e);
        }
    };
    if (item) fetchUserVote();
  }, [item, type]);

  if (!item) return null;

  const isFilm = type === 'film';
  const filmItem = isFilm ? (item as Film) : null;
  const musicItem = !isFilm ? (item as Musica) : null;

  const image = isFilm ? filmItem?.poster : musicItem?.copertina;
  const title = isFilm ? filmItem?.titolo : musicItem?.titolo;
  const subtitle = isFilm ? filmItem?.anno_uscita : musicItem?.artista;
  const description = isFilm ? filmItem?.trama : musicItem?.descrizione;

  const formatMediaType = (type: string) => {
      const map: Record<string, string> = {
          'dvd': 'DVD',
          'vhs': 'VHS',
          'bray': 'Blu-ray',
          'cd': 'CD',
          'vinyl': 'Vinyl',
          'cass': 'Cassette',
          'unknown': 'Unknown'
      };
      return map[type] || type.toUpperCase();
  };

  const handleVote = async () => {
    if (voteValue === '') return;

    setSubmitting(true);
    try {
        const payload: any = {
            valore: Number(voteValue)
        };

        if (isFilm) {
            payload.film = item.id;
        } else {
            payload.musica = item.id;
        }

        await api.post('voti/', payload);
        alert(t('Save') + '!');
        onVoteSuccess();
        onClose();
    } catch (error) {
        console.error(error);
        alert('Error saving vote');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <h2 style={{ paddingRight: '2rem' }}>{title}</h2>
        <div className="text-muted" style={{ marginBottom: '1rem' }}>
          {subtitle} {isFilm ? '' : `(${musicItem?.anno_uscita})`}
        </div>

        <div className="modal-content-split">
          <div className="modal-left">
            {image ? (
              <img src={image} alt={title} />
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: isFilm ? '2/3' : '1/1',
                backgroundColor: 'var(--color-bg-element)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                No Image
              </div>
            )}

            <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                {isFilm ? '🎬 Movie' : '🎵 Music'}
            </div>
          </div>

          <div className="modal-right">
            {description && (
                <div style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                    <strong>{t('Description')}:</strong><br/>
                    {description}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <strong>{t('MediaType')}:</strong> {formatMediaType(item.media_type)}
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>{t('Position')}:</strong> {item.posizione_fisica}
            </div>

            <hr style={{ borderColor: 'var(--color-border)', margin: '1.5rem 0' }} />

            <h3>{existingVote ? t('UpdatingVote') : t('NewVote')}</h3>
            <div className="flex gap-2 items-center">
                <select
                    value={voteValue}
                    onChange={(e) => setVoteValue(Number(e.target.value))}
                    style={{ maxWidth: '100px' }}
                >
                    <option value="">...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                <button
                    className="btn"
                    onClick={handleVote}
                    disabled={submitting || voteValue === ''}
                >
                    {submitting ? '...' : t('Save')}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
