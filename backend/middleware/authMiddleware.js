function isAdminUser(user) {
  return user?.is_admin === true || user?.is_admin === 1;
}

function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Nincs bejelentkezett felhasználó.',
    });
  }

  next();
}

function requireSelfOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Nincs bejelentkezett felhasználó.',
    });
  }

  const requestedUserId = Number(req.params.id);
  const loggedInUserId = Number(req.user.id);

  if (!Number.isInteger(requestedUserId)) {
    return res.status(400).json({
      error: 'Érvénytelen felhasználó azonosító.',
    });
  }

  const isOwnProfile = loggedInUserId === requestedUserId;
  const isAdmin = isAdminUser(req.user);

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({
      error: 'Nincs jogosultságod ehhez a felhasználói profilhoz.',
    });
  }

  next();
}

module.exports = {
  requireLogin,
  requireSelfOrAdmin,
};