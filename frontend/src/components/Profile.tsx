import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    // For votes list, reusing types/components ideally, but simplified here
    const [votes, setVotes] = useState<any[]>([]);

    useEffect(() => {
        // Fetch votes
        const fetchVotes = async () => {
            try {
                const response = await api.get('voti/');
                setVotes(response.data.results || response.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchVotes();
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('user/change_password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            setMessage('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
        } catch (error: any) {
            setMessage('Error: ' + (error.response?.data?.old_password || 'Failed to update'));
        }
    };

    return (
        <div className="profile-container">
            <h1>{t('Profile')}</h1>

            <div className="forms-container">
                <div className="form-box">
                    <h2>{t('ChangePassword')}</h2>
                    {message && <div className="message">{message}</div>}
                    <form onSubmit={handleChangePassword}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>{t('CurrentPassword')}</label>
                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>{t('NewPassword')}</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn">{t('Update')}</button>
                    </form>
                </div>

                <div className="form-box">
                    <h2>{t('MyVotes')}</h2>
                    {votes.length === 0 ? (
                        <p>{t('NoVotes')}</p>
                    ) : (
                        <div className="votes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                            {votes.map(vote => {
                                const details = vote.item_details;
                                return (
                                    <div key={vote.id} className="vote-card" style={{ textAlign: 'center' }}>
                                        {details?.image ? (
                                            <img
                                                src={details.image}
                                                alt={details.title}
                                                style={{ width: '100%', aspectRatio: details.type === 'film' ? '2/3' : '1/1', borderRadius: '8px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', aspectRatio: '1/1', background: '#333', borderRadius: '8px' }} />
                                        )}
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0 0.2rem' }}>
                                            {details?.title || 'Unknown'}
                                        </div>
                                        <div className={`badge-voto ${
                                            vote.valore >= 8 ? 'voto-ottimo' :
                                            vote.valore >= 6 ? 'voto-buono' :
                                            vote.valore >= 4 ? 'voto-medio' :
                                            'voto-scarso'
                                        }`}>
                                            {vote.valore}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
