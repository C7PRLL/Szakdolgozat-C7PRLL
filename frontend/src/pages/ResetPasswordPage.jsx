import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasValidated = useRef(false);

  const [tokenValid, setTokenValid] = useState(false);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasValidated.current) return;
    hasValidated.current = true;

    const validateToken = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('Hiányzó token.');
          setChecking(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/users/validate-reset-token?token=${token}`
        );

        if (response.data.valid) {
          setTokenValid(true);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'A jelszó-visszaállító link érvénytelen vagy lejárt.'
        );
      } finally {
        setChecking(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = searchParams.get('token');

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/reset-password',
        {
          token,
          password,
          confirmPassword,
        }
      );

      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Hiba történt a jelszó módosítása közben.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Jelszó-visszaállítás</h1>
        <p>Token ellenőrzése...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Jelszó-visszaállítás</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/forgot-password">Új link kérése</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Új jelszó beállítása</h1>

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
          type="password"
          placeholder="Új jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px' }}
        />

        <input
          type="password"
          placeholder="Új jelszó megerősítése"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: '12px' }}
        />

        <button type="submit" disabled={loading} style={{ padding: '12px' }}>
          {loading ? 'Mentés...' : 'Jelszó módosítása'}
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