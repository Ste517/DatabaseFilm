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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--color-bg-card)] rounded-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-element)] text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors text-xl leading-none"
            onClick={onClose}
        >
            &times;
        </button>

        <h2 className="text-2xl font-bold pr-10 mb-1">{title}</h2>
        <div className="text-[var(--color-text-muted)] mb-4 text-sm md:text-base">
          {subtitle} {isFilm ? '' : `(${musicItem?.anno_uscita})`}
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="md:w-48 flex-shrink-0">
            {image ? (
              <img src={image} alt={title} className="w-full rounded-md shadow-md object-cover" />
            ) : (
              <div className="w-full bg-[var(--color-bg-element)] flex items-center justify-center rounded-md text-[var(--color-text-muted)] aspect-[2/3]">
                No Image
              </div>
            )}
            
          </div>

          <div className="flex-1">
            {description && (
                <div className="mb-6 whitespace-pre-wrap">
                    <strong className="block mb-1 text-[var(--color-primary)]">{t('Description')}:</strong>
                    <p className="text-sm md:text-base leading-relaxed">{description}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <strong className="block text-xs uppercase text-[var(--color-text-muted)] mb-1">{t('MediaType')}</strong>
                    <span className="font-medium">{formatMediaType(item.media_type)}</span>
                </div>
                <div>
                    <strong className="block text-xs uppercase text-[var(--color-text-muted)] mb-1">{t('Position')}</strong>
                    <span className="font-medium">{item.posizione_fisica}</span>
                </div>
            </div>

            <hr className="border-[var(--color-border)] my-6" />

            <h3 className="text-lg font-bold mb-3">{existingVote ? t('UpdatingVote') : t('NewVote')}</h3>
            <div className="flex gap-3 items-center">
                <select
                    value={voteValue}
                    onChange={(e) => setVoteValue(Number(e.target.value))}
                    className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] w-24"
                >
                    <option value="">...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                <button
                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
