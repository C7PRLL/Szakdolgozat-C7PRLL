import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Aktiválás folyamatban...');
  const [error, setError] = useState('');
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;

    hasRequested.current = true;

    const activate = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setMessage('');
          setError('Hiányzó token.');
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/users/activate-account?token=${token}`
        );

        setMessage(response.data.message);
        setError('');
      } catch (err) {
        setMessage('');
        setError(
          err.response?.data?.error || 'Hiba történt a fiók aktiválása közben.'
        );
      }
    };

    activate();
  }, [searchParams]);

  return (
    <main className="activate-page">
      <div className="activate-card">
        <h1>Fiók aktiválása</h1>

        {message && <p className="activate-success">{message}</p>}

        {error && <p className="activate-error">{error}</p>}

        <Link className="activate-login-link" to="/login">
          Bejelentkezés
        </Link>
      </div>
    </main>
  );
}