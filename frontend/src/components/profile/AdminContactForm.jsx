import { useState } from 'react';
import axios from 'axios';

function AdminContactForm() {
  const [adminMessageData, setAdminMessageData] = useState({
    subject: '',
    message: '',
  });

  const handleAdminMessageSend = async (e) => {
    e.preventDefault();

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

  return (
    <div className="profile-section">
      <h3 className="profile-section-title">Üzenet küldése az adminnak</h3>

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
          className="profile-input profile-input-small"
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
          className="profile-textarea profile-input-small"
        />

        <button type="submit" className="profile-button profile-button-full">
          Üzenet küldése
        </button>
      </form>
    </div>
  );
}

export default AdminContactForm;