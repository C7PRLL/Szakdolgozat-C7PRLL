const express = require('express');
const {
  syncDrivers,
  syncCurrentDriverStandings,
  syncCurrentConstructorStandings,
  syncCurrentDriversSeasonPoints,
  fullF1Sync,
} = require('../services/f1SyncService');
const { syncF1News } = require('../services/newsSyncService');

const router = express.Router();

router.post('/drivers', async (req, res) => {
  try {
    const result = await syncDrivers();
    res.json(result);
  } catch (error) {
    console.error('Driver sync hiba:', error);
    res.status(500).json({ error: 'Driver sync hiba.' });
  }
});

router.post('/standings', async (req, res) => {
  try {
    const driverResult = await syncCurrentDriverStandings();
    const constructorResult = await syncCurrentConstructorStandings();

    res.json({
      success: true,
      driverStandings: driverResult,
      constructorStandings: constructorResult,
    });
  } catch (error) {
    console.error('Standings sync hiba:', error);
    res.status(500).json({ error: 'Standings sync hiba.' });
  }
});

router.post('/season-points', async (req, res) => {
  try {
    await syncCurrentDriverStandings();
    const result = await syncCurrentDriversSeasonPoints();
    res.json(result);
  } catch (error) {
    console.error('Season points sync hiba:', error);
    res.status(500).json({ error: 'Season points sync hiba.' });
  }
});

router.post('/news', async (req, res) => {
  try {
    const result = await syncF1News();
    res.json(result);
  } catch (error) {
    console.error('News sync hiba:', error.response?.data || error.message || error);
    res.status(500).json({
      error: 'News sync hiba.',
      details: error.response?.data || error.message || 'Ismeretlen hiba',
    });
  }
});

router.post('/all', async (req, res) => {
  try {
    const f1Result = await fullF1Sync();
    const newsResult = await syncF1News();

    res.json({
      success: true,
      f1: f1Result,
      news: newsResult,
    });
  } catch (error) {
    console.error('Full sync hiba:', error);
    res.status(500).json({ error: 'Full sync hiba.' });
  }
});

module.exports = router;