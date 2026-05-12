import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PasswordChangeForm() {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

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

  return (
    <form onSubmit={handlePasswordChange}>
      <h3 className="profile-form-title">Jelszó módosítása</h3>

      <label className="profile-label">Jelenlegi jelszó</label>
      <input
        type="password"
        value={passwordData.currentPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            currentPassword: e.target.value,
          })
        }
        className="profile-input"
      />

      <label className="profile-label">Új jelszó</label>
      <input
        type="password"
        value={passwordData.newPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            newPassword: e.target.value,
          })
        }
        className="profile-input"
      />

      <label className="profile-label">Új jelszó megerősítése</label>
      <input
        type="password"
        value={passwordData.confirmNewPassword}
        onChange={(e) =>
          setPasswordData({
            ...passwordData,
            confirmNewPassword: e.target.value,
          })
        }
        className="profile-input"
      />

      <button type="submit" className="profile-button">
        Jelszó módosítása
      </button>
    </form>
  );
}

export default PasswordChangeForm;