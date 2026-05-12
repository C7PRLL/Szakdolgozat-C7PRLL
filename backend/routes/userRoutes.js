const express = require('express');
const router = express.Router();

const { User } = require('../models');
const { ValidationError } = require('sequelize');

const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const {
  sendVerificationEmail,
  sendAdminRegistrationEmail,
  sendPasswordResetEmail,
  sendContactAdminEmail,
} = require('../utils/mailer');

const { validatePassword } = require('../utils/passwordValidator');

const {
  requireLogin,
  requireSelfOrAdmin,
} = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

function handleRouteError(res, err) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.errors?.[0]?.message || 'Érvénytelen adat.',
    });
  }

  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: 'Hiba történt a kérés feldolgozása során.',
    });
  }

  return res.status(500).json({
    error: 'Szerverhiba történt.',
  });
}

const safeUserAttributes = {
  exclude: [
    'password',
    'plainPassword',
    'verification_token',
    'verification_expires_at',
    'password_reset_token',
    'password_reset_expires_at',
    'google_id',
    'facebook_id',
  ],
};

// regisztráció
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'A név, email és jelszó megadása kötelező.',
      });
    }

    validatePassword(password);

    const existing = await User.findOne({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({
        error: 'Az email cím már foglalt!',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      is_verified: false,
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt,
    });

    await sendVerificationEmail(newUser.email, newUser.name, verificationToken);
    await sendAdminRegistrationEmail(newUser);

    return res.status(201).json({
      message:
        'Sikeres regisztráció! Ellenőrizd az emailedet a fiók aktiválásához.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_verified: newUser.is_verified,
      },
    });
  } catch (err) {
    console.error('REGISTER HIBA:', err);
    return handleRouteError(res, err);
  }
});

// fiók aktiválása
router.get('/activate-account', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Hiányzó token.',
      });
    }

    const user = await User.findOne({
      where: {
        verification_token: token,
        is_verified: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Érvénytelen vagy már felhasznált token.',
      });
    }

    if (
      !user.verification_expires_at ||
      user.verification_expires_at < new Date()
    ) {
      return res.status(400).json({
        error: 'A token lejárt.',
      });
    }

    user.is_verified = true;
    user.verified_at = new Date();
    user.verification_token = null;
    user.verification_expires_at = null;

    await user.save();

    return res.status(200).json({
      message: 'A fiók sikeresen aktiválva lett.',
    });
  } catch (err) {
    console.error('AKTIVÁLÁSI HIBA:', err);
    return handleRouteError(res, err);
  }
});

// elfelejtett pw
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Az email megadása kötelező.',
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        message:
          'Ha létezik ilyen email cím a rendszerben, elküldtük a jelszó-visszaállítási linket.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.password_reset_token = resetToken;
    user.password_reset_expires_at = resetExpiresAt;

    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.status(200).json({
      message:
        'Ha létezik ilyen email cím a rendszerben, elküldtük a jelszó-visszaállítási linket.',
    });
  } catch (err) {
    console.error('FORGOT PASSWORD HIBA:', err);
    return handleRouteError(res, err);
  }
});

// reset token ellenőrzés
router.get('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Hiányzó token.',
      });
    }

    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Érvénytelen token.',
      });
    }

    if (
      !user.password_reset_expires_at ||
      user.password_reset_expires_at < new Date()
    ) {
      return res.status(400).json({
        error: 'A token lejárt.',
      });
    }

    return res.status(200).json({
      message: 'A token érvényes.',
      valid: true,
    });
  } catch (err) {
    console.error('VALIDATE RESET TOKEN HIBA:', err);
    return handleRouteError(res, err);
  }
});

// jelszó resi tokennel
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'A token, az új jelszó és a megerősítés megadása kötelező.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'A két jelszó nem egyezik.',
      });
    }

    validatePassword(password);

    const user = await User.findOne({
      where: {
        password_reset_token: token,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Érvénytelen token.',
      });
    }

    if (
      !user.password_reset_expires_at ||
      user.password_reset_expires_at < new Date()
    ) {
      return res.status(400).json({
        error: 'A token lejárt.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_expires_at = null;

    await user.save();

    return res.status(200).json({
      message: 'A jelszó sikeresen módosítva lett.',
    });
  } catch (err) {
    console.error('RESET PASSWORD HIBA:', err);
    return handleRouteError(res, err);
  }
});

// profil pw módosítás
router.post('/change-password', requireLogin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        error:
          'A jelenlegi jelszó, az új jelszó és a megerősítés megadása kötelező.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        error: 'A két új jelszó nem egyezik.',
      });
    }

    validatePassword(newPassword);

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található.',
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        error: 'A jelenlegi jelszó hibás.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_expires_at = null;

    await user.save();

    return res.status(200).json({
      message: 'A jelszó sikeresen módosítva lett.',
    });
  } catch (err) {
    console.error('CHANGE PASSWORD HIBA:', err);
    return handleRouteError(res, err);
  }
});

// üzenet adminnak
router.post('/contact-admin', requireLogin, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        error: 'A tárgy és az üzenet megadása kötelező.',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található.',
      });
    }

    await sendContactAdminEmail(user, subject, message);

    return res.status(200).json({
      message: 'Az üzenet sikeresen elküldve az adminnak.',
    });
  } catch (err) {
    console.error('CONTACT ADMIN HIBA:', err);
    return handleRouteError(res, err);
  }
});

// bejelentkezés + session létrehozás
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Az email és jelszó megadása kötelező.',
      });
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található!',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        error: 'Ez a felhasználó social loginon keresztül jött létre.',
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: 'A fiók még nincs aktiválva.\nEllenőrizd az emailedet.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Hibás jelszó!',
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('SESSION LOGIN HIBA:', loginErr);

        return res.status(500).json({
          error:
            'Sikeres jelszóellenőrzés történt, de a session létrehozása nem sikerült.',
        });
      }

      return res.status(200).json({
        message: 'Sikeres bejelentkezés!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
          is_verified: user.is_verified,
          profile_image: user.profile_image || null,
        },
      });
    });
  } catch (err) {
    console.error('LOGIN HIBA:', err);
    return handleRouteError(res, err);
  }
});

// kijelentkezés
router.post('/logout', (req, res) => {
  req.logout((logoutErr) => {
    if (logoutErr) {
      console.error('LOGOUT HIBA:', logoutErr);

      return res.status(500).json({
        error: 'Kijelentkezési hiba.',
      });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('SESSION TÖRLÉSI HIBA:', sessionErr);

        return res.status(500).json({
          error: 'Session törlési hiba.',
        });
      }

      res.clearCookie('connect.sid');

      return res.status(200).json({
        message: 'Sikeres kijelentkezés.',
      });
    });
  });
});

// profil adatok lekérése
router.get('/:id', requireSelfOrAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: safeUserAttributes,
    });

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található.',
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('PROFIL LEKÉRÉS HIBA:', err);
    return handleRouteError(res, err);
  }
});

// profil frissítés
router.put(
  '/update/:id',
  requireSelfOrAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { bio, favorite_team, favorite_pilot } = req.body;

      const updateData = {
        bio,
        favorite_team,
        favorite_pilot,
      };

      if (req.file) {
        updateData.profile_image = req.file.filename;
      }

      await User.update(updateData, {
        where: {
          id: req.params.id,
        },
      });

      const updatedUser = await User.findByPk(req.params.id, {
        attributes: safeUserAttributes,
      });

      if (!updatedUser) {
        return res.status(404).json({
          error: 'Felhasználó nem található.',
        });
      }

      return res.status(200).json({
        message: 'Profil frissítve!',
        user: updatedUser,
      });
    } catch (err) {
      console.error('PROFIL FRISSÍTÉS HIBA:', err);
      return handleRouteError(res, err);
    }
  }
);

module.exports = router;