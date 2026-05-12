import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ProfileCard from '../components/profile/ProfileCard';
import AdminContactForm from '../components/profile/AdminContactForm';
import UserBookings from '../components/profile/UserBookings';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';

import '../components/profile/profile.css';

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser) {
          setLoading(false);
          setBookingsLoading(false);
          return;
        }

        const [userRes, bookingsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${storedUser.id}`, {
            withCredentials: true,
          }),
          axios.get(
            `http://localhost:5000/api/bookings/my-bookings/${storedUser.id}`,
            {
              withCredentials: true,
            }
          ),
        ]);

        if (userRes.data) {
          setUser(userRes.data);
        }

        if (Array.isArray(bookingsRes.data)) {
          setBookings(bookingsRes.data);
        }
      } catch (error) {
        console.error('Profil vagy foglalás lekérési hiba:', error);
      } finally {
        setLoading(false);
        setBookingsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!user) return;

    const confirmed = window.confirm(
      'Biztosan le szeretnéd mondani ezt a foglalást?'
    );

    if (!confirmed) return;

    try {
      setCancelLoadingId(bookingId);

      const res = await axios.delete(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          data: {
            user_id: user.id,
          },
          withCredentials: true,
        }
      );

      alert(res.data?.message || 'A foglalás sikeresen lemondva.');

      setBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingId)
      );
    } catch (error) {
      console.error('Foglalás lemondási hiba:', error);
      alert(
        error?.response?.data?.error ||
          'Hiba történt a foglalás lemondása során.'
      );
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/users/logout',
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Kijelentkezési hiba:', error);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <p>Betöltés...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-panel">
            <h2>Profil</h2>
            <p>Nincs bejelentkezve.</p>

            <button
              type="button"
              className="profile-button"
              onClick={() => navigate('/login')}
            >
              Ugrás a belépéshez
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container profile-grid">
        <div className="profile-left">
          <ProfileCard user={user} onLogout={handleLogout} />

          {!user.is_admin && <AdminContactForm />}

          <UserBookings
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            cancelLoadingId={cancelLoadingId}
            onCancelBooking={handleCancelBooking}
          />
        </div>

        <div className="profile-panel">
          <h2 className="profile-title">Saját Profil</h2>

          <ProfileEditForm user={user} setUser={setUser} />

          <hr className="profile-divider" />

          <PasswordChangeForm />

          <hr className="profile-divider" />
        </div>
      </div>
    </main>
  );
}

export default Profile;