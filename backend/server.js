const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const db = require('./models');
const bcrypt = require('bcryptjs');

const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const newsRoutes = require('./routes/newsRoutes');
const authRoutes = require('./routes/authRoutes');
const syncRoutes = require('./routes/SyncRoutes');

// CRON JOB
require('./jobs/verificationCleanupJob');

const app = express();
const { User } = db;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// kompatibilitás
app.use('/api/pilots', driverRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Backend működik' });
});

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Siker: kapcsolódva a MariaDB-hez.');
    return db.sequelize.sync({ alter: true });
  })
  .then(async () => {
    console.log('Adatbázis szinkronizálva.');

    const existingAdmin = await User.findOne({
      where: { email: 'admin@admin.com' },
    });

    if (!existingAdmin) {
      const defaultAdminPassword = 'Admin123!';
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

      await User.create({
        name: 'admin',
        email: 'admin@admin.com',
        plainPassword: defaultAdminPassword,
        password: hashedPassword,
        is_admin: true,
        is_verified: true,
      });

      console.log('✅ Alap admin user létrehozva');
      console.log('Admin email: admin@admin.com');
      console.log('Admin jelszó: Admin123!');
    } else {
      console.log('ℹ️ Az admin user már létezik');
    }

    app.listen(PORT, () => {
      console.log(`A szerver fut: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Hiba:', err);
  });