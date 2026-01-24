import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { getVoteBadgeStyle } from '../utils/styleUtils';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const [votes, setVotes] = useState<any[]>([]);

    useEffect(() => {
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
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">{t('Profile')}</h1>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Change Password */}
                <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
                    <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">{t('ChangePassword')}</h2>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('CurrentPassword')}</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('NewPassword')}</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition-colors"
                        >
                            {t('Update')}
                        </button>
                    </form>
                </div>

                {/* My Votes */}
                <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
                    <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">{t('MyVotes')}</h2>

                    {votes.length === 0 ? (
                        <p className="text-[var(--text-muted)]">{t('NoVotes')}</p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {votes.map(vote => {
                                const details = vote.item_details;
                                return (
                                    <div key={vote.id} className="flex flex-col items-center text-center">
                                        <div className="relative w-full aspect-[2/3] mb-2 overflow-hidden rounded-md bg-[var(--bg-secondary)]">
                                            {details?.image ? (
                                                <img
                                                    src={details.image}
                                                    alt={details.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="text-xs font-medium text-[var(--text-primary)] line-clamp-1 w-full mb-1">
                                            {details?.title || 'Unknown'}
                                        </div>
                                        <div className="text-xs" {...getVoteBadgeStyle(vote.valore)}>
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
