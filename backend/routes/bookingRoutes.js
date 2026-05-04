const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Booking, User } = require('../models');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Új foglalás mentése + visszaigazoló email küldése
router.post('/', async (req, res) => {
  try {
    const { user_id, activity_type, booking_date, time_slot } = req.body;

    if (!user_id || !activity_type || !booking_date || !time_slot) {
      return res.status(400).json({
        error: 'A user_id, activity_type, booking_date és time_slot megadása kötelező.',
      });
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        error: 'Felhasználó nem található.',
      });
    }

    const newBooking = await Booking.create({
      user_id,
      activity_type,
      booking_date,
      time_slot,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Sikeres időpontfoglalás - F1 Academy',
      html: `
        <h2>Szia ${user.name}!</h2>
        <p>A foglalásod sikeresen rögzítésre került.</p>

        <p><strong>Foglalás részletei:</strong></p>
        <ul>
          <li><strong>Gokart típusa:</strong> ${activity_type}</li>
          <li><strong>Dátum:</strong> ${booking_date}</li>
          <li><strong>Idősáv:</strong> ${time_slot}</li>
        </ul>

        <p>Amennyiben szeretnéd törölni a foglalásodat, azt a profilodban megteheted.</p>

        <p>Üdv,<br>F1 Academy</p>
      `,
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    console.error('Szerver hiba mentéskor:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Egy adott felhasználó saját foglalásainak lekérése
router.get('/my-bookings/:userId', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.params.userId },
      order: [
        ['booking_date', 'ASC'],
        ['time_slot', 'ASC'],
      ],
    });

    return res.json(bookings);
  } catch (err) {
    console.error('Foglalások lekérési hiba:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Foglalás lemondása
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: 'A user_id megadása kötelező.',
      });
    }

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        user_id,
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: 'A foglalás nem található, vagy nem ehhez a felhasználóhoz tartozik.',
      });
    }

    await booking.destroy();

    return res.status(200).json({
      message: 'A foglalás sikeresen lemondva.',
    });
  } catch (err) {
    console.error('Foglalás lemondási hiba:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;