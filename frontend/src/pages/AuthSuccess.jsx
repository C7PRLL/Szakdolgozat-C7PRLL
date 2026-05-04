import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          withCredentials: true,
        });

        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          navigate('/profile');
          window.location.reload();
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth success hiba:', error);
        navigate('/login');
      }
    };

    finishLogin();
  }, [navigate]);

  return (
    <div className="wrapper">
      <div className="container">
        <section
          className="glass-box"
          style={{ maxWidth: '500px', margin: '0 auto', padding: '2em', textAlign: 'center' }}
        >
          <h2>Bejelentkezés folyamatban...</h2>
          <p>Kérlek várj egy pillanatot.</p>
        </section>
      </div>
    </div>
  );
}

export default AuthSuccess;