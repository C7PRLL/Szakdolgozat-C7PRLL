import { useEffect, useState } from 'react';
import axios from 'axios';

function ProfileEditForm({ user, setUser }) {
  const [formData, setFormData] = useState({
    bio: '',
    favorite_team: '',
    favorite_pilot: '',
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!user) return;

    setFormData({
      bio: user.bio || '',
      favorite_team: user.favorite_team || '',
      favorite_pilot: user.favorite_pilot || '',
    });
  }, [user]);

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

  return (
    <form onSubmit={handleUpdate}>
      <h3 className="profile-form-title">Profil szerkesztése</h3>

      <label className="profile-label">Rólam (Bio)</label>
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
        className="profile-textarea"
      />

      <label className="profile-label">Kedvenc Csapat</label>
      <input
        type="text"
        value={formData.favorite_team}
        onChange={(e) =>
          setFormData({
            ...formData,
            favorite_team: e.target.value,
          })
        }
        className="profile-input"
      />

      <label className="profile-label">Kedvenc Versenyző</label>
      <input
        type="text"
        value={formData.favorite_pilot}
        onChange={(e) =>
          setFormData({
            ...formData,
            favorite_pilot: e.target.value,
          })
        }
        className="profile-input"
      />

      <label className="profile-label">Profilkép módosítása</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="profile-file-input"
      />

      <button type="submit" className="profile-button">
        Változtatások mentése
      </button>
    </form>
  );
}

export default ProfileEditForm;