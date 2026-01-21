import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { getVoteBadgeStyle } from '../utils/styleUtils';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
            setMessageType('success');
            setMessage('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
        } catch (error: any) {
            setMessageType('error');
            setMessage('Error: ' + (error.response?.data?.old_password || 'Failed to update'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-[var(--color-primary)]">{t('Profile')}</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">{t('ChangePassword')}</h2>
                    {message && (
                        <div className={`p-3 rounded-md mb-4 font-medium text-sm ${messageType === 'success' ? 'bg-green-500/10 border border-green-500 text-green-500' : 'bg-red-500/10 border border-red-500 text-red-500'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">{t('CurrentPassword')}</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">{t('NewPassword')}</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            {t('Update')}
                        </button>
                    </form>
                </div>

                <div className="flex-[2] bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-lg">
                    <h2 className="text-xl font-bold mb-4 border-b border-[var(--color-border)] pb-2">{t('MyVotes')}</h2>
                    {votes.length === 0 ? (
                        <p className="text-[var(--color-text-muted)]">{t('NoVotes')}</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {votes.map(vote => {
                                const details = vote.item_details;
                                return (
                                    <div key={vote.id} className="text-center group cursor-pointer">
                                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                                            {details?.image ? (
                                                <img
                                                    src={details.image}
                                                    alt={details.title}
                                                    className={`w-full h-full object-cover ${details.type !== 'film' ? 'aspect-square' : ''}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--color-bg-element)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-1 right-1">
                                                <span style={getVoteBadgeStyle(vote.valore)} className="px-1.5 py-0.5 rounded text-xs font-bold text-white shadow-sm">
                                                    {vote.valore}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold truncate px-1" title={details?.title}>
                                            {details?.title || 'Unknown'}
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
