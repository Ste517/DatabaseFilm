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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold pr-8 mb-1">{title}</h2>
            <div className="text-[var(--text-secondary)] text-lg mb-6">
            {subtitle} {isFilm ? '' : `(${musicItem?.anno_uscita})`}
            </div>

            <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
            {/* Left Column: Image */}
            <div className="flex justify-center md:justify-start">
                {image ? (
                <img
                    src={image}
                    alt={title}
                    className="w-full max-w-sm rounded-lg shadow-lg object-cover aspect-[2/3]"
                />
                ) : (
                <div className="w-full max-w-sm aspect-[2/3] bg-[var(--bg-hover)] rounded-lg flex items-center justify-center text-[var(--text-muted)]">
                    No Image
                </div>
                )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col">
                {description && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-2">{t('Description')}</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{description}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                        <span className="block text-[var(--text-muted)] mb-1">{t('MediaType')}</span>
                        <span className="font-medium text-[var(--text-primary)]">{formatMediaType(item.media_type)}</span>
                    </div>
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                        <span className="block text-[var(--text-muted)] mb-1">{t('Position')}</span>
                        <span className="font-medium text-[var(--text-primary)]">{item.posizione_fisica}</span>
                    </div>
                </div>

                <div className="mt-auto border-t border-[var(--border-color)] pt-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                        {existingVote ? t('UpdatingVote') : t('NewVote')}
                    </h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            value={voteValue}
                            onChange={(e) => setVoteValue(Number(e.target.value))}
                            className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                        >
                            <option value="">Vote...</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        <button
                            className="px-6 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleVote}
                            disabled={submitting || voteValue === ''}
                        >
                            {submitting ? 'Saving...' : t('Save')}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
