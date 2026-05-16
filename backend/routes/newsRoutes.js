const express = require('express');
const { NewsArticle } = require('../models');

const router = express.Router();

// hírek listázása a legfrissebb legyen elől
router.get('/', async (req, res) => {
  try {
    const news = await NewsArticle.findAll({
      where: { is_active: true },
      order: [['published_at', 'DESC'], ['id', 'DESC']],
    });

    res.json(news);
  } catch (error) {
    console.error('Hiba a hírek lekérésekor:', error);
    res.status(500).json({ error: 'Nem sikerült lekérni a híreket.' });
  }
});

module.exports = router;