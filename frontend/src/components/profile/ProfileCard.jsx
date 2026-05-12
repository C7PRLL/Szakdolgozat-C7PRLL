function ProfileCard({ user, onLogout }) {
  const imageUrl = user.profile_image
    ? `http://localhost:5000/uploads/${user.profile_image}`
    : null;

  return (
    <div className="profile-panel profile-user-card">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profilkép"
          className="profile-avatar-image"
        />
      ) : (
        <div className="profile-avatar-placeholder">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}

      <h3 className="profile-user-name">{user.name}</h3>
      <p className="profile-user-email">{user.email}</p>

      {user.is_admin && <span className="profile-admin-badge">Admin fiók</span>}

    </div>
  );
}

export default ProfileCard;