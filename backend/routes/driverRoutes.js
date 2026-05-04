const express = require('express');
const axios = require('axios');
const { Op } = require('sequelize');

const {
  Driver,
  DriverStanding,
  DriverSeasonPoint,
  Constructor,
  ConstructorStanding,
} = require('../models');

const router = express.Router();

const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

function isDnfStatus(status) {
  if (!status) return false;

  const normalizedStatus = String(status).trim();

  if (normalizedStatus === 'Finished') {
    return false;
  }

  if (/^\+\d+\s+Lap(s)?$/i.test(normalizedStatus)) {
    return false;
  }

  return true;
}

// Összes versenyző
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.findAll({
      order: [
        ['family_name', 'ASC'],
        ['given_name', 'ASC'],
      ],
    });

    res.json(drivers);
  } catch (error) {
    console.error('Hiba a driverek lekérésekor:', error);

    res.status(500).json({
      error: 'Nem sikerült lekérni a versenyzőket.',
    });
  }
});

// Aktuális pilóta tabella
router.get('/standings/drivers', async (req, res) => {
  try {
    const standings = await DriverStanding.findAll({
      order: [['position', 'ASC']],
    });

    const driverIds = [
      ...new Set(standings.map((s) => s.driver_id).filter(Boolean)),
    ];

    const constructorIds = [
      ...new Set(standings.map((s) => s.constructor_id).filter(Boolean)),
    ];

    const drivers = driverIds.length
      ? await Driver.findAll({
          where: {
            id: {
              [Op.in]: driverIds,
            },
          },
        })
      : [];

    const constructors = constructorIds.length
      ? await Constructor.findAll({
          where: {
            id: {
              [Op.in]: constructorIds,
            },
          },
        })
      : [];

    const driverMap = {};
    const constructorMap = {};

    drivers.forEach((driver) => {
      driverMap[driver.id] = driver;
    });

    constructors.forEach((constructor) => {
      constructorMap[constructor.id] = constructor;
    });

    const result = standings.map((standing) => ({
      ...standing.toJSON(),
      driver: driverMap[standing.driver_id] || null,
      constructor: constructorMap[standing.constructor_id] || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Hiba a driver standings lekérésekor:', error);

    res.status(500).json({
      error: 'Nem sikerült lekérni a pilóta tabellát.',
    });
  }
});

// Aktuális pilóták több éves pontdiagramja
router.get('/statistics/current-points', async (req, res) => {
  try {
    const existingCount = await DriverSeasonPoint.count();

    if (existingCount === 0) {
      return res.status(409).json({
        error:
          'A statisztikai adatok még nincsenek szinkronizálva. Futtasd a /api/sync/season-points végpontot.',
      });
    }

    const seasonPoints = await DriverSeasonPoint.findAll({
      include: [
        {
          model: Driver,
          as: 'driver',
        },
      ],
      order: [
        ['season_year', 'ASC'],
        [{ model: Driver, as: 'driver' }, 'full_name', 'ASC'],
      ],
    });

    const result = seasonPoints.map((item) => ({
      id: item.id,
      season_year: item.season_year,
      position: item.position,
      points: item.points,
      wins: item.wins,
      driver: item.driver
        ? {
            id: item.driver.id,
            external_id: item.driver.external_id,
            full_name: item.driver.full_name,
            code: item.driver.code,
          }
        : null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Hiba a szezonpontok lekérésekor:', error);

    res.status(500).json({
      error: 'Nem sikerült lekérni a szezonpontokat.',
    });
  }
});

// Aktuális pilóták elmúlt 5 éves DNF statisztikája
router.get('/statistics/dnf-last-five-years', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const years = [];

    for (let year = currentYear - 4; year <= currentYear; year += 1) {
      years.push(year);
    }

    const activeDrivers = await Driver.findAll({
      where: {
        is_active: true,
      },
      order: [['full_name', 'ASC']],
    });

    if (!activeDrivers.length) {
      return res.status(409).json({
        error:
          'Nincs aktív pilóta adat. Előbb futtasd a szinkronizálást.',
      });
    }

    const activeDriverMap = new Map();
    const dnfMap = new Map();

    activeDrivers.forEach((driver) => {
      activeDriverMap.set(driver.external_id, {
        id: driver.id,
        external_id: driver.external_id,
        full_name: driver.full_name,
        code: driver.code,
      });

      years.forEach((year) => {
        dnfMap.set(`${driver.external_id}-${year}`, {
          season_year: year,
          dnf_count: 0,
          driver: {
            id: driver.id,
            external_id: driver.external_id,
            full_name: driver.full_name,
            code: driver.code,
          },
        });
      });
    });

    for (const year of years) {
      const url = `${JOLPICA_BASE_URL}/${year}/results.json?limit=2000`;

      const response = await axios.get(url);

      const races = response.data?.MRData?.RaceTable?.Races || [];

      races.forEach((race) => {
        const results = race.Results || [];

        results.forEach((result) => {
          const externalDriverId = result.Driver?.driverId;

          if (!externalDriverId) return;

          const activeDriver = activeDriverMap.get(externalDriverId);

          if (!activeDriver) return;

          if (!isDnfStatus(result.status)) return;

          const key = `${externalDriverId}-${year}`;
          const existing = dnfMap.get(key);

          if (!existing) return;

          existing.dnf_count += 1;
        });
      });
    }

    const result = Array.from(dnfMap.values()).sort((a, b) => {
      if (a.season_year !== b.season_year) {
        return a.season_year - b.season_year;
      }

      return a.driver.full_name.localeCompare(b.driver.full_name);
    });

    res.json(result);
  } catch (error) {
    console.error('Hiba a DNF statisztika lekérésekor:', error);

    res.status(500).json({
      error: 'Nem sikerült lekérni a DNF statisztikai adatokat.',
    });
  }
});

// Aktuális konstruktőri tabella
router.get('/standings/constructors', async (req, res) => {
  try {
    const standings = await ConstructorStanding.findAll({
      order: [['position', 'ASC']],
    });

    const constructorIds = [
      ...new Set(standings.map((s) => s.constructor_id).filter(Boolean)),
    ];

    const constructors = constructorIds.length
      ? await Constructor.findAll({
          where: {
            id: {
              [Op.in]: constructorIds,
            },
          },
        })
      : [];

    const constructorMap = {};

    constructors.forEach((constructor) => {
      constructorMap[constructor.id] = constructor;
    });

    const result = standings.map((standing) => ({
      ...standing.toJSON(),
      constructor: constructorMap[standing.constructor_id] || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Hiba a constructor standings lekérésekor:', error);

    res.status(500).json({
      error: 'Nem sikerült lekérni a konstruktőri tabellát.',
    });
  }
});

module.exports = router;