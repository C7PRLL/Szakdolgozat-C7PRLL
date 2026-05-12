function UserBookings({
  bookings,
  bookingsLoading,
  cancelLoadingId,
  onCancelBooking,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="profile-bookings">
      <h3 className="profile-section-title">Foglalt időpontjaim</h3>

      {bookingsLoading ? (
        <p className="profile-muted">Foglalások betöltése...</p>
      ) : bookings.length === 0 ? (
        <p className="profile-muted">Jelenleg nincs foglalt időpontod.</p>
      ) : (
        <div className="profile-booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="profile-booking-card">
              <div className="profile-booking-data">
                <div>
                  <strong>Gokart típusa:</strong>{' '}
                  {booking.activity_type || '-'}
                </div>

                <div>
                  <strong>Dátum:</strong> {formatDate(booking.booking_date)}
                </div>

                <div>
                  <strong>Idősáv:</strong> {booking.time_slot || '-'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCancelBooking(booking.id)}
                disabled={cancelLoadingId === booking.id}
                className="profile-button profile-button-full"
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
  );
}

export default UserBookings;