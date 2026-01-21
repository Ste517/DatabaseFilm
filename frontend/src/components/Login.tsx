import React, { useState } from 'react';
import api from '../api/axios';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('token/', { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', username);

      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError('Credenziali non valide o errore del server.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-[var(--color-bg-body)]">
      <div className="w-full max-w-md bg-[var(--color-bg-card)] p-8 rounded-xl border border-[var(--color-border)] shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-primary)]">Login</h2>

        {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-6 font-medium text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
