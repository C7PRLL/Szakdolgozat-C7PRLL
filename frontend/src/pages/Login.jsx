import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      await axios.post(
        'http://localhost:5000/api/users/login',
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        withCredentials: true,
      });

      localStorage.setItem('user', JSON.stringify(meResponse.data));

      setMessage('Sikeres bejelentkezés!');

      // Teljes reload, hogy minden komponens lássa az új auth állapotot
      window.location.href = '/';
    } catch (err) {
      setError(
        err.response?.data?.error || 'Hiba történt a bejelentkezés során.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgb(11, 15, 35), rgb(26, 28, 52))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#ffffff',
            marginBottom: '10px',
            fontSize: '32px',
            fontWeight: '700',
          }}
        >
          Bejelentkezés
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '28px',
          }}
        >
          Lépj be az F1 Akadémia fiókodba
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ffffff',
                fontSize: '14px',
              }}
            >
              Email cím
            </label>
            <input
              id="email"
              type="email"
              placeholder="pelda@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ffffff',
                fontSize: '14px',
              }}
            >
              Jelszó
            </label>
            <input
              id="password"
              type="password"
              placeholder="Add meg a jelszavad"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-4px' }}>
            <Link
              to="/forgot-password"
              style={{
                color: '#ff4d6d',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Elfelejtetted a jelszavad?
            </Link>
          </div>

          {message && (
            <div
              style={{
                background: 'rgba(0, 180, 120, 0.15)',
                border: '1px solid rgba(0, 180, 120, 0.35)',
                color: '#9ef0c8',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(255, 77, 109, 0.12)',
                border: '1px solid rgba(255, 77, 109, 0.35)',
                color: '#ff8ea3',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              background: '#ff4d6d',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '22px 0 18px 0',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255,255,255,0.12)',
            }}
          />
          <span
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '13px',
            }}
          >
            vagy
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(255,255,255,0.12)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Bejelentkezés Google-lel
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Bejelentkezés Facebookkal
          </button>
        </div>

        <div
          style={{
            marginTop: '22px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '14px',
          }}
        >
          Még nincs fiókod?{' '}
          <Link
            to="/register"
            style={{
              color: '#ff4d6d',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Regisztráció
          </Link>
        </div>
      </div>
    </div>
  );
}