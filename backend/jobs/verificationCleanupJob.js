const cron = require('node-cron');
const { User } = require('../models');
const { Op } = require('sequelize');

// Minden egész órában lefut
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    const deletedCount = await User.destroy({
      where: {
        is_verified: false,
        verification_expires_at: {
          [Op.lt]: now,
        },
      },
    });

    console.log(
      `[CRON] Lejárt, nem aktivált fiókok törölve: ${deletedCount}`
    );
  } catch (error) {
    console.error('[CRON] Hiba a verification takarításnál:', error);
  }
});