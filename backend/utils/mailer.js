const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(to, name, token) {
  const activationLink = `${process.env.FRONTEND_URL}/activate-account?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Fiók aktiválása - F1 Academy',
    html: `
      <h2>Szia ${name}!</h2>

      <p>Köszönjük a regisztrációt az F1 Academy rendszerébe.</p>

      <p>A fiókod aktiválásához kattints az alábbi linkre:</p>

      <p>
        <a href="${activationLink}">
          Fiók aktiválása
        </a>
      </p>

      <p>A link 24 óráig érvényes.</p>

      <p>Ha nem te regisztráltál, ezt az emailt figyelmen kívül hagyhatod.</p>
    `,
  });
}

async function sendAdminRegistrationEmail(user) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: 'Új regisztráció történt - F1 Academy',
    html: `
      <h2>Új felhasználó regisztrált</h2>

      <p><strong>Név:</strong> ${user.name}</p>

      <p><strong>Email:</strong> ${user.email}</p>

      <p><strong>Felhasználó ID:</strong> ${user.id}</p>
    `,
  });
}

async function sendPasswordResetEmail(to, name, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Elfelejtett jelszó - F1 Academy',
    html: `
      <h2>Szia ${name}!</h2>

      <p>Jelszó-visszaállítási kérelmet kaptunk az F1 Academy fiókodhoz.</p>

      <p>Ha valóban te indítottad el ezt a folyamatot, kattints az alábbi linkre:</p>

      <p>
        <a href="${resetLink}">
          Jelszó visszaállítása
        </a>
      </p>

      <p>A link 1 óráig érvényes.</p>

      <p>Ha nem te indítottad el ezt a folyamatot, nincs semmi teendőd.</p>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendAdminRegistrationEmail,
  sendPasswordResetEmail,
};