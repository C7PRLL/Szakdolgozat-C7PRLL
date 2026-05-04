const express = require('express');

const router = express.Router();

const nodemailer = require('nodemailer');

const { User, Booking } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,

  port: Number(process.env.SMTP_PORT),

  secure: false,

  auth: {
    user: process.env.SMTP_USER,

    pass: process.env.SMTP_PASS,
  },
});

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Nincs bejelentkezve.' });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Nincs admin jogosultságod.' });
  }

  next();
}

// Összes user lekérése

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',

        'name',

        'email',

        'is_admin',

        'is_verified',

        'createdAt',

        'updatedAt',
      ],

      order: [['id', 'ASC']],
    });

    return res.json(users);
  } catch (err) {
    console.error('ADMIN USERS GET HIBA:', err);

    return res.status(500).json({ error: err.message });
  }
});

// User törlése

router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);

    if (req.user.id === targetUserId) {
      return res.status(400).json({
        error: 'Saját magadat nem törölheted.',
      });
    }

    const user = await User.findByPk(targetUserId);

    if (!user) {
      return res.status(404).json({ error: 'Felhasználó nem található.' });
    }

    await Booking.destroy({
      where: { user_id: targetUserId },
    });

    await user.destroy();

    return res.json({ message: 'Felhasználó sikeresen törölve.' });
  } catch (err) {
    console.error('ADMIN USER DELETE HIBA:', err);

    return res.status(500).json({ error: err.message });
  }
});

// Összes foglalás lekérése

router.get('/bookings', requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [
        ['booking_date', 'ASC'],

        ['time_slot', 'ASC'],

        ['id', 'ASC'],
      ],
    });

    return res.json(bookings);
  } catch (err) {
    console.error('ADMIN BOOKINGS GET HIBA:', err);

    return res.status(500).json({ error: err.message });
  }
});

// Foglalás módosítása

router.put('/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const { activity_type, booking_date, time_slot } = req.body;

    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Foglalás nem található.' });
    }

    if (!activity_type || !booking_date || !time_slot) {
      return res.status(400).json({
        error: 'Az activity_type, booking_date és time_slot mezők kötelezőek.',
      });
    }

    const oldActivityType = booking.activity_type;
    const oldBookingDate = booking.booking_date;
    const oldTimeSlot = booking.time_slot;

    booking.activity_type = activity_type;

    booking.booking_date = booking_date;

    booking.time_slot = time_slot;

    await booking.save();

    const user = await User.findByPk(booking.user_id);

    if (user && user.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,

          to: user.email,

          subject: 'Időpontfoglalás módosítása - F1 Academy',

          html: `
            <h2>Szia ${user.name}!</h2>

            <p>Értesítünk, hogy az adminisztrátor módosította az időpontfoglalásodat.</p>

            <p><strong>Korábbi foglalás részletei:</strong></p>

            <ul>
              <li><strong>Gokart típusa:</strong> ${oldActivityType}</li>
              <li><strong>Dátum:</strong> ${oldBookingDate}</li>
              <li><strong>Idősáv:</strong> ${oldTimeSlot}</li>
            </ul>

            <p><strong>Új foglalás részletei:</strong></p>

            <ul>
              <li><strong>Gokart típusa:</strong> ${activity_type}</li>
              <li><strong>Dátum:</strong> ${booking_date}</li>
              <li><strong>Idősáv:</strong> ${time_slot}</li>
            </ul>

            <p>Üdv,<br>F1 Academy</p>
          `,
        });
      } catch (emailErr) {
        console.error('ADMIN BOOKING UPDATE EMAIL HIBA:', emailErr);
      }
    }

    return res.json({
      message: 'Foglalás sikeresen módosítva.',

      booking,
    });
  } catch (err) {
    console.error('ADMIN BOOKING UPDATE HIBA:', err);

    return res.status(500).json({ error: err.message });
  }
});

// Foglalás törlése

router.delete('/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Foglalás nem található.' });
    }

    const user = await User.findByPk(booking.user_id);

    const deletedActivityType = booking.activity_type;
    const deletedBookingDate = booking.booking_date;
    const deletedTimeSlot = booking.time_slot;

    await booking.destroy();

    if (user && user.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,

          to: user.email,

          subject: 'Időpontfoglalás törlése - F1 Academy',

          html: `
            <h2>Szia ${user.name}!</h2>

            <p>Értesítünk, hogy az adminisztrátor törölte az időpontfoglalásodat.</p>

            <p><strong>Törölt foglalás részletei:</strong></p>

            <ul>
              <li><strong>Gokart típusa:</strong> ${deletedActivityType}</li>
              <li><strong>Dátum:</strong> ${deletedBookingDate}</li>
              <li><strong>Idősáv:</strong> ${deletedTimeSlot}</li>
            </ul>

            <p>Üdv,<br>F1 Academy</p>
          `,
        });
      } catch (emailErr) {
        console.error('ADMIN BOOKING DELETE EMAIL HIBA:', emailErr);
      }
    }

    return res.json({ message: 'Foglalás sikeresen törölve.' });
  } catch (err) {
    console.error('ADMIN BOOKING DELETE HIBA:', err);

    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;