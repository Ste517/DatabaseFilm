import React, { useState } from 'react';
import api from '../api/axios';
import '../App.css'; // Reuse existing styles

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
      const response = await api.post('/token/', { username, password });
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
    <div className="login-container">
      <div className="login-box">
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Login</h2>

        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }}>
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
