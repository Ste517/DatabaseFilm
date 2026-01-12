import React, { useState } from 'react';
import api from '../api/axios';
import type { Film, Musica } from '../types';

interface DetailModalProps {
  item: Film | Musica | null;
  type: 'film' | 'musica';
  onClose: () => void;
  onVoteSuccess: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, type, onClose, onVoteSuccess }) => {
  const [voteValue, setVoteValue] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const isFilm = type === 'film';
  // Cast to specific type safely
  const filmItem = isFilm ? (item as Film) : null;
  const musicItem = !isFilm ? (item as Musica) : null;

  const image = isFilm ? filmItem?.poster : musicItem?.copertina;
  const title = isFilm ? filmItem?.titolo : musicItem?.titolo;
  const subtitle = isFilm ? filmItem?.anno_uscita : musicItem?.artista;
  const description = isFilm ? filmItem?.trama : musicItem?.descrizione;

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
        alert('Voto salvato!');
        onVoteSuccess(); // Refresh data potentially
        onClose();
    } catch (error) {
        console.error(error);
        alert('Errore nel salvataggio del voto');
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
          </div>

          <div className="modal-right">
            {description && (
                <div style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                    <strong>Descrizione:</strong><br/>
                    {description}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <strong>Media Type:</strong> {item.media_type}
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <strong>Posizione:</strong> {item.posizione_fisica}
            </div>

            <hr style={{ borderColor: 'var(--color-border)', margin: '1.5rem 0' }} />

            <h3>Il tuo voto</h3>
            <div className="flex gap-2 items-center">
                <select
                    value={voteValue}
                    onChange={(e) => setVoteValue(Number(e.target.value))}
                    style={{ maxWidth: '100px' }}
                >
                    <option value="">Vota...</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                <button
                    className="btn"
                    onClick={handleVote}
                    disabled={submitting || voteValue === ''}
                >
                    {submitting ? '...' : 'Salva'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
