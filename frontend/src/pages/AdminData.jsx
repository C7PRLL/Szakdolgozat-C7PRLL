import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminData() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editForm, setEditForm] = useState({
    activity_type: '',
    booking_date: '',
    time_slot: '',
  });

  const slotsByType = {
    'Bérgokart': ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'],
    'Versenygokart': ['08:00 - 08:30', '09:00 - 09:30', '10:00 - 10:30'],
    'Verseny csomag': ['09:00 - 11:00', '14:00 - 16:00'],
  };

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  useEffect(() => {
    if (!storedUser) {
      navigate('/login');
      return;
    }

    if (!storedUser.is_admin) {
      navigate('/');
      return;
    }

    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [usersRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', {
          withCredentials: true,
        }),
        axios.get('http://localhost:5000/api/admin/bookings', {
          withCredentials: true,
        }),
      ]);

      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Admin adatok betöltési hiba:', err);
      alert(err?.response?.data?.error || 'Nem sikerült betölteni az admin adatokat.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Biztosan törölni szeretnéd ezt a felhasználót?\n\n${userName} (ID: ${userId})`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        withCredentials: true,
      });

      alert('Felhasználó törölve.');
      fetchAll();
    } catch (err) {
      console.error('Felhasználó törlési hiba:', err);
      alert(err?.response?.data?.error || 'Nem sikerült törölni a felhasználót.');
    }
  };

  const startEditBooking = (booking) => {
    setEditingBookingId(booking.id);
    setEditForm({
      activity_type: booking.activity_type || 'Bérgokart',
      booking_date: booking.booking_date || '',
      time_slot:
        booking.time_slot ||
        slotsByType[booking.activity_type || 'Bérgokart']?.[0] ||
        '',
    });
  };

  const cancelEditBooking = () => {
    setEditingBookingId(null);
    setEditForm({
      activity_type: '',
      booking_date: '',
      time_slot: '',
    });
  };

  const handleBookingTypeChange = (value) => {
    setEditForm({
      ...editForm,
      activity_type: value,
      time_slot: slotsByType[value]?.[0] || '',
    });
  };

  const handleSaveBooking = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/bookings/${bookingId}`,
        {
          activity_type: editForm.activity_type,
          booking_date: editForm.booking_date,
          time_slot: editForm.time_slot,
        },
        {
          withCredentials: true,
        }
      );

      alert('Foglalás módosítva.');
      cancelEditBooking();
      fetchAll();
    } catch (err) {
      console.error('Foglalás mentési hiba:', err);
      alert(err?.response?.data?.error || 'Nem sikerült módosítani a foglalást.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const confirmed = window.confirm('Biztosan törölni szeretnéd ezt a foglalást?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
        withCredentials: true,
      });

      alert('Foglalás törölve.');
      fetchAll();
    } catch (err) {
      console.error('Foglalás törlési hiba:', err);
      alert(err?.response?.data?.error || 'Nem sikerült törölni a foglalást.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: '140px 40px 40px', color: '#fff' }}>
        Betöltés...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '140px 20px 40px',
        background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(24,24,24,1) 100%)',
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, marginBottom: '10px' }}>Admin adatok</h1>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>
          Felhasználók és foglalások kezelése
        </p>

        <section
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '30px',
            overflowX: 'auto',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '18px' }}>Felhasználók</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Név</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Admin</th>
                <th style={thStyle}>Aktív</th>
                <th style={thStyle}>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={tdStyle}>{u.id}</td>
                  <td style={tdStyle}>{u.name}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.is_admin ? 'Igen' : 'Nem'}</td>
                  <td style={tdStyle}>{u.is_verified ? 'Igen' : 'Nem'}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={storedUser?.id === u.id}
                      style={{
                        ...dangerButtonStyle,
                        opacity: storedUser?.id === u.id ? 0.5 : 1,
                        cursor: storedUser?.id === u.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Törlés
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan="6">
                    Nincs megjeleníthető felhasználó.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '24px',
            overflowX: 'auto',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '18px' }}>Foglalások</h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1150px' }}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Felhasználó</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Típus</th>
                <th style={thStyle}>Dátum</th>
                <th style={thStyle}>Idősáv</th>
                <th style={thStyle}>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const isEditing = editingBookingId === booking.id;
                const bookingUser = userMap[booking.user_id];

                return (
                  <tr key={booking.id}>
                    <td style={tdStyle}>{booking.id}</td>
                    <td style={tdStyle}>{booking.user_id}</td>
                    <td style={tdStyle}>{bookingUser?.name || '-'}</td>
                    <td style={tdStyle}>{bookingUser?.email || '-'}</td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <select
                          value={editForm.activity_type}
                          onChange={(e) => handleBookingTypeChange(e.target.value)}
                          style={inputStyle}
                        >
                          <option value="Bérgokart">Bérgokart</option>
                          <option value="Versenygokart">Versenygokart</option>
                          <option value="Verseny csomag">Verseny csomag</option>
                        </select>
                      ) : (
                        booking.activity_type
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.booking_date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, booking_date: e.target.value })
                          }
                          style={inputStyle}
                        />
                      ) : (
                        booking.booking_date
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <select
                          value={editForm.time_slot}
                          onChange={(e) =>
                            setEditForm({ ...editForm, time_slot: e.target.value })
                          }
                          style={inputStyle}
                        >
                          {(slotsByType[editForm.activity_type] || []).map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      ) : (
                        booking.time_slot
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleSaveBooking(booking.id)}
                            style={primaryButtonStyle}
                          >
                            Mentés
                          </button>
                          <button onClick={cancelEditBooking} style={secondaryButtonStyle}>
                            Mégse
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => startEditBooking(booking)}
                            style={primaryButtonStyle}
                          >
                            Módosítás
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            style={dangerButtonStyle}
                          >
                            Törlés
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {bookings.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan="8">
                    Nincs megjeleníthető foglalás.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  verticalAlign: 'middle',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  boxSizing: 'border-box',
};

const primaryButtonStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
};

const secondaryButtonStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '600',
};

const dangerButtonStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: '600',
};

export default AdminData;