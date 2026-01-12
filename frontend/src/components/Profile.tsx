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
                        <ul className="lista">
                            {votes.map(vote => (
                                <li key={vote.id}>
                                    ID: {vote.film || vote.musica} - Voto: {vote.valore}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
