const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { ValidationError } = require('sequelize');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const {
  sendVerificationEmail,
  sendAdminRegistrationEmail,
  sendPasswordResetEmail,
} = require('../utils/mailer');

const {
  validatePassword,
} = require('../utils/passwordValidator');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function handleRouteError(res, err) {
  if (err.statusCode === 400 || err instanceof ValidationError) {
    return res.status(400).json({
      error: err.errors?.[0]?.message || err.message,
    });
  }

  return res.status(500).json({ error: err.message });
}

// REGISZTRÁCIÓ
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'A név, email és jelszó megadása kötelező.',
      });
    }

    validatePassword(password);

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({ error: 'Az email cím már foglalt!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      plainPassword: password,
      password: hashedPassword,
      is_verified: false,
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt,
    });

    await sendVerificationEmail(newUser.email, newUser.name, verificationToken);
    await sendAdminRegistrationEmail(newUser);

    return res.status(201).json({
      message: 'Sikeres regisztráció! Ellenőrizd az emailedet a fiók aktiválásához.',
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

// FIÓK AKTIVÁLÁS
router.get('/activate-account', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Hiányzó token.' });
    }

    const user = await User.findOne({
      where: {
        verification_token: token,
        is_verified: false,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: 'Érvénytelen vagy már felhasznált token.' });
    }

    if (
      !user.verification_expires_at ||
      user.verification_expires_at < new Date()
    ) {
      return res.status(400).json({ error: 'A token lejárt.' });
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
    return res.status(500).json({ error: err.message });
  }
});

// ELFELEJTETT JELSZÓ
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Az email megadása kötelező.',
      });
    }

    const user = await User.findOne({ where: { email } });

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
    return res.status(500).json({ error: err.message });
  }
});

// RESET TOKEN ELLENŐRZÉS
router.get('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Hiányzó token.' });
    }

    const user = await User.findOne({
      where: { password_reset_token: token },
    });

    if (!user) {
      return res.status(404).json({ error: 'Érvénytelen token.' });
    }

    if (
      !user.password_reset_expires_at ||
      user.password_reset_expires_at < new Date()
    ) {
      return res.status(400).json({ error: 'A token lejárt.' });
    }

    return res.status(200).json({
      message: 'A token érvényes.',
      valid: true,
    });
  } catch (err) {
    console.error('VALIDATE RESET TOKEN HIBA:', err);
    return res.status(500).json({ error: err.message });
  }
});

// JELSZÓ RESET TOKENNEL
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'A token, az új jelszó és a megerősítés megadása kötelező.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'A két jelszó nem egyezik.' });
    }

    validatePassword(password);

    const user = await User.findOne({
      where: { password_reset_token: token },
    });

    if (!user) {
      return res.status(404).json({ error: 'Érvénytelen token.' });
    }

    if (
      !user.password_reset_expires_at ||
      user.password_reset_expires_at < new Date()
    ) {
      return res.status(400).json({ error: 'A token lejárt.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.plainPassword = password;
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

// PROFILBÓL JELSZÓ MÓDOSÍTÁS
router.post('/change-password', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Nincs bejelentkezett felhasználó.',
      });
    }

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

    user.plainPassword = newPassword;
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

// ÜZENET KÜLDÉSE AZ ADMINNAK
router.post('/contact-admin', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Nincs bejelentkezett felhasználó.',
      });
    }

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

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_NOTIFY_EMAIL,
      replyTo: user.email,
      subject: `[F1 Academy] Üzenet a profil oldalról - ${subject}`,
      html: `
        <h2>Új üzenet érkezett a profil oldalról</h2>

        <p><strong>Név:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Felhasználó ID:</strong> ${user.id}</p>

        <p><strong>Tárgy:</strong> ${subject}</p>

        <p><strong>Üzenet:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      message: 'Az üzenet sikeresen elküldve az adminnak.',
    });
  } catch (err) {
    console.error('CONTACT ADMIN HIBA:', err);
    return res.status(500).json({ error: err.message });
  }
});

// BEJELENTKEZÉS + SESSION
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található!' });
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
      return res.status(401).json({ error: 'Hibás jelszó!' });
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
    return res.status(500).json({ error: err.message });
  }
});

// KIJELENTKEZÉS
router.post('/logout', (req, res) => {
  req.logout((logoutErr) => {
    if (logoutErr) {
      return res.status(500).json({ error: 'Kijelentkezési hiba.' });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ error: 'Session törlési hiba.' });
      }

      res.clearCookie('connect.sid');

      return res.status(200).json({
        message: 'Sikeres kijelentkezés.',
      });
    });
  });
});

// PROFIL ADATOK LEKÉRÉSE
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található.',
      });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PROFIL FRISSÍTÉSE
router.put('/update/:id', upload.single('image'), async (req, res) => {
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
      where: { id: req.params.id },
    });

    const updatedUser = await User.findByPk(req.params.id);

    return res.json({
      message: 'Profil frissítve!',
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;