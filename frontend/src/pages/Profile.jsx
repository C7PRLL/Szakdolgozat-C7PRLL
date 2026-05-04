import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    bio: '',
    favorite_team: '',
    favorite_pilot: '',
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [adminMessageData, setAdminMessageData] = useState({
    subject: '',
    message: '',
  });

  const [bookings, setBookings] = useState([]);
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

          setFormData({
            bio: userRes.data.bio || '',
            favorite_team: userRes.data.favorite_team || '',
            favorite_pilot: userRes.data.favorite_pilot || '',
          });
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

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user) return;

    const data = new FormData();

    data.append('bio', formData.bio);
    data.append('favorite_team', formData.favorite_team);
    data.append('favorite_pilot', formData.favorite_pilot);

    if (image) {
      data.append('image', image);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/update/${user.id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      alert('Sikeres mentés!');
      window.location.reload();
    } catch (error) {
      console.error('Profil mentési hiba:', error);
      alert('Hiba a mentés során.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!user) return;

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmNewPassword
    ) {
      alert('Kérlek, tölts ki minden jelszó mezőt.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('Az új jelszó és a megerősítés nem egyezik.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/users/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword,
        },
        {
          withCredentials: true,
        }
      );

      alert(
        res.data?.message ||
          'A jelszó sikeresen módosult.\nKérlek, jelentkezz be újra.'
      );

      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Jelszó módosítási hiba:', error);

      const message =
        error?.response?.data?.error ||
        'Hiba történt a jelszó módosítása során.';

      alert(message);
    }
  };

  const handleAdminMessageSend = async (e) => {
    e.preventDefault();

    if (!user) return;

    if (!adminMessageData.subject || !adminMessageData.message) {
      alert('Kérlek, add meg a tárgyat és az üzenetet is.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/users/contact-admin',
        {
          subject: adminMessageData.subject,
          message: adminMessageData.message,
        },
        {
          withCredentials: true,
        }
      );

      alert(res.data?.message || 'Az üzenet sikeresen elküldve.');

      setAdminMessageData({
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Admin üzenetküldési hiba:', error);

      alert(
        error?.response?.data?.error ||
          'Hiba történt az üzenet elküldése során.'
      );
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <p>Betöltés...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <h2>Profil</h2>
        <p>Nincs bejelentkezve.</p>

        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Ugrás a belépéshez
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '48px',
        color: '#fff',
        background: '#181922',
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 380px) 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '24px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            {user.profile_image ? (
              <img
                src={`http://localhost:5000/uploads/${user.profile_image}`}
                alt="Profilkép"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(255,255,255,0.15)',
                  marginBottom: '16px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: '#e10600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '42px',
                  fontWeight: 'bold',
                  margin: '0 auto 16px',
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}

            <h3 style={{ margin: '0 0 8px' }}>{user.name}</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>{user.email}</p>

            {user.is_admin && (
              <p
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(225,6,0,0.18)',
                  color: '#ff4b4b',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                Admin fiók
              </p>
            )}
          </div>

          {!user.is_admin && (
            <>
              <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>
                Üzenet küldése az adminnak
              </h3>

              <form onSubmit={handleAdminMessageSend}>
                <input
                  type="text"
                  placeholder="Tárgy"
                  value={adminMessageData.subject}
                  onChange={(e) =>
                    setAdminMessageData({
                      ...adminMessageData,
                      subject: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '12px',
                  }}
                />

                <textarea
                  placeholder="Üzenet"
                  rows="4"
                  value={adminMessageData.message}
                  onChange={(e) =>
                    setAdminMessageData({
                      ...adminMessageData,
                      message: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '14px',
                    resize: 'vertical',
                  }}
                />

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Üzenet küldése
                </button>
              </form>
            </>
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
              Foglalt időpontjaim
            </h3>

            {bookingsLoading ? (
              <p style={{ opacity: 0.8, margin: 0 }}>
                Foglalások betöltése...
              </p>
            ) : bookings.length === 0 ? (
              <p style={{ opacity: 0.8, margin: 0 }}>
                Jelenleg nincs foglalt időpontod.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gap: '8px',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <strong>Gokart típusa:</strong>{' '}
                        {booking.activity_type || '-'}
                      </div>

                      <div>
                        <strong>Dátum:</strong>{' '}
                        {formatDate(booking.booking_date)}
                      </div>

                      <div>
                        <strong>Idősáv:</strong> {booking.time_slot || '-'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelLoadingId === booking.id}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor:
                          cancelLoadingId === booking.id
                            ? 'not-allowed'
                            : 'pointer',
                        fontWeight: 'bold',
                        opacity: cancelLoadingId === booking.id ? 0.7 : 1,
                      }}
                    >
                      {cancelLoadingId === booking.id
                        ? 'Lemondás folyamatban...'
                        : 'Foglalás lemondása'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '24px',
          }}
        >
          <h2 style={{ marginBottom: '8px', marginTop: 0 }}>Saját Profil</h2>

          <p style={{ opacity: 0.8, marginBottom: '24px' }}>
            Kezeld az adataidat és a megjelenésedet
          </p>

          <form onSubmit={handleUpdate}>
            <h3 style={{ marginBottom: '16px' }}>Profil szerkesztése</h3>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Rólam (Bio)
            </label>

            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio: e.target.value,
                })
              }
              placeholder="Írj magadról pár szót..."
              rows="4"
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
                marginBottom: '16px',
                resize: 'vertical',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Kedvenc Csapat
            </label>

            <input
              type="text"
              value={formData.favorite_team}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  favorite_team: e.target.value,
                })
              }
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
                marginBottom: '16px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Kedvenc Versenyző
            </label>

            <input
              type="text"
              value={formData.favorite_pilot}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  favorite_pilot: e.target.value,
                })
              }
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
                marginBottom: '16px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Profilkép módosítása
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{
                marginBottom: '20px',
                color: '#fff',
              }}
            />

            <button
              type="submit"
              className="button primary"
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Változtatások mentése
            </button>
          </form>

          <hr style={{ margin: '32px 0', opacity: 0.3 }} />

          <form onSubmit={handlePasswordChange}>
            <h3 style={{ marginBottom: '16px' }}>Jelszó módosítása</h3>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Jelenlegi jelszó
            </label>

            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
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
                marginBottom: '16px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Új jelszó
            </label>

            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
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
                marginBottom: '16px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Új jelszó megerősítése
            </label>

            <input
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmNewPassword: e.target.value,
                })
              }
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
                marginBottom: '20px',
              }}
            />

            <button
              type="submit"
              className="button primary"
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Jelszó módosítása
            </button>
          </form>

          <hr style={{ margin: '32px 0', opacity: 0.3 }} />
        </div>
      </div>
    </main>
  );
}

export default Profile;