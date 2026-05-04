import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/forgot-password',
        { email }
      );

      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Hiba történt az elfelejtett jelszó kérés során.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Elfelejtett jelszó</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px' }}
        />

        <button type="submit" disabled={loading} style={{ padding: '12px' }}>
          {loading ? 'Küldés...' : 'Jelszó-visszaállító link küldése'}
        </button>
      </form>

      {message && <p style={{ color: 'lightgreen', marginTop: '20px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        <Link to="/login">Vissza a bejelentkezéshez</Link>
      </div>
    </div>
  );
}