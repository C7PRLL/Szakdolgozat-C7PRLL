const axios = require('axios');
const {
  Driver,
  Constructor,
  DriverStanding,
  ConstructorStanding,
  DriverSeasonPoint,
} = require('../models');

const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const SEASON_POINTS_FROM_YEAR = 2020;
const SEASON_POINTS_TO_YEAR = 2026;

function extractDriverList(responseData) {
  return responseData?.MRData?.DriverTable?.Drivers || [];
}

function extractDriverStandingsList(responseData) {
  return (
    responseData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ||
    []
  );
}

function extractConstructorStandingsList(responseData) {
  return (
    responseData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ||
    []
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWithRetry(url, maxRetries = 5, baseDelay = 2500) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 429 && attempt < maxRetries) {
        const waitTime = baseDelay * (attempt + 1);
        console.warn(
          `429 throttled: ${url} | retry ${attempt + 1}/${maxRetries} | wait ${waitTime}ms`
        );
        await sleep(waitTime);
        continue;
      }

      throw error;
    }
  }
}

async function syncDrivers() {
  let offset = 0;
  const limit = 100;
  let total = Infinity;
  let processed = 0;

  while (offset < total) {
    const url = `${JOLPICA_BASE_URL}/drivers.json?limit=${limit}&offset=${offset}`;
    const response = await getWithRetry(url);
    const data = response.data;

    const drivers = extractDriverList(data);
    total = Number(data?.MRData?.total || 0);

    for (const item of drivers) {
      const driverId = item.driverId;
      const givenName = item.givenName || '';
      const familyName = item.familyName || '';
      const fullName = `${givenName} ${familyName}`.trim();

      await Driver.upsert({
        external_id: driverId,
        given_name: givenName,
        family_name: familyName,
        full_name: fullName,
        code: item.code || null,
        permanent_number: item.permanentNumber || null,
        nationality: item.nationality || null,
        date_of_birth: item.dateOfBirth || null,
        wiki_url: item.url || null,
        last_synced_at: new Date(),
      });

      processed += 1;
      await sleep(120);
    }

    offset += limit;
    await sleep(400);
  }

  return {
    success: true,
    processed,
  };
}

async function syncCurrentDriverStandings() {
  const url = `${JOLPICA_BASE_URL}/current/driverstandings.json`;
  const response = await getWithRetry(url);
  const standings = extractDriverStandingsList(response.data);

  if (!standings.length) {
    return {
      success: true,
      processed: 0,
      message: 'Nincs driver standings adat.',
    };
  }

  const seasonYear = Number(
    response.data?.MRData?.StandingsTable?.season || new Date().getFullYear()
  );
  const round = Number(
    response.data?.MRData?.StandingsTable?.round || 0
  );

  await Driver.update({ is_active: false }, { where: {} });

  await DriverStanding.destroy({
    where: {
      season_year: seasonYear,
      round,
    },
  });

  let processed = 0;

  for (const item of standings) {
    const driverExternalId = item?.Driver?.driverId;
    if (!driverExternalId) continue;

    const [driver] = await Driver.findOrCreate({
      where: { external_id: driverExternalId },
      defaults: {
        external_id: driverExternalId,
        given_name: item?.Driver?.givenName || '',
        family_name: item?.Driver?.familyName || '',
        full_name: `${item?.Driver?.givenName || ''} ${item?.Driver?.familyName || ''}`.trim(),
        code: item?.Driver?.code || null,
        permanent_number: item?.Driver?.permanentNumber || null,
        nationality: item?.Driver?.nationality || null,
        date_of_birth: item?.Driver?.dateOfBirth || null,
        wiki_url: item?.Driver?.url || null,
        is_active: true,
        last_synced_at: new Date(),
      },
    });

    const constructorInfo = item?.Constructors?.[0];
    let constructorId = null;

    if (constructorInfo?.constructorId) {
      const [constructor] = await Constructor.findOrCreate({
        where: { external_id: constructorInfo.constructorId },
        defaults: {
          external_id: constructorInfo.constructorId,
          name: constructorInfo.name || constructorInfo.constructorId,
          nationality: constructorInfo.nationality || null,
          wiki_url: constructorInfo.url || null,
          last_synced_at: new Date(),
        },
      });

      constructorId = constructor.id;
    }

    await DriverStanding.create({
      season_year: seasonYear,
      round,
      driver_id: driver.id,
      constructor_id: constructorId,
      position: Number(item.position),
      points: Number(item.points || 0),
      wins: Number(item.wins || 0),
      fetched_at: new Date(),
    });

    await driver.update({
      is_active: true,
      last_synced_at: new Date(),
    });

    processed += 1;
    await sleep(200);
  }

  return {
    success: true,
    processed,
    season_year: seasonYear,
    round,
  };
}

async function syncCurrentConstructorStandings() {
  const url = `${JOLPICA_BASE_URL}/current/constructorstandings.json`;
  const response = await getWithRetry(url);
  const standings = extractConstructorStandingsList(response.data);

  if (!standings.length) {
    return {
      success: true,
      processed: 0,
      message: 'Nincs constructor standings adat.',
    };
  }

  const seasonYear = Number(
    response.data?.MRData?.StandingsTable?.season || new Date().getFullYear()
  );
  const round = Number(
    response.data?.MRData?.StandingsTable?.round || 0
  );

  await ConstructorStanding.destroy({
    where: {
      season_year: seasonYear,
      round,
    },
  });

  let processed = 0;

  for (const item of standings) {
    const constructorExternalId = item?.Constructor?.constructorId;
    if (!constructorExternalId) continue;

    const [constructor] = await Constructor.findOrCreate({
      where: { external_id: constructorExternalId },
      defaults: {
        external_id: constructorExternalId,
        name: item?.Constructor?.name || constructorExternalId,
        nationality: item?.Constructor?.nationality || null,
        wiki_url: item?.Constructor?.url || null,
        last_synced_at: new Date(),
      },
    });

    await ConstructorStanding.create({
      season_year: seasonYear,
      round,
      constructor_id: constructor.id,
      position: Number(item.position),
      points: Number(item.points || 0),
      wins: Number(item.wins || 0),
      fetched_at: new Date(),
    });

    await constructor.update({
      last_synced_at: new Date(),
    });

    processed += 1;
    await sleep(200);
  }

  return {
    success: true,
    processed,
    season_year: seasonYear,
    round,
  };
}

function getSeasonRange(fromYear = SEASON_POINTS_FROM_YEAR, toYear = SEASON_POINTS_TO_YEAR) {
  const years = [];
  for (let year = fromYear; year <= toYear; year += 1) {
    years.push(year);
  }
  return years;
}

async function syncCurrentDriversSeasonPoints() {
  const activeDrivers = await Driver.findAll({
    where: { is_active: true },
    order: [['full_name', 'ASC']],
  });

  if (!activeDrivers.length) {
    return {
      success: true,
      processedDrivers: 0,
      processedSeasons: 0,
      message: 'Nincs aktív pilóta. Előbb futtasd a standings syncet.',
    };
  }

  const activeDriversMap = new Map();
  for (const driver of activeDrivers) {
    activeDriversMap.set(driver.external_id, driver);
  }

  const activeDriverIds = activeDrivers.map((driver) => driver.id);

  await DriverSeasonPoint.destroy({
    where: {
      driver_id: activeDriverIds,
    },
  });

  const years = getSeasonRange();
  let processedDrivers = 0;
  let processedSeasons = 0;

  for (const seasonYear of years) {
    const url = `${JOLPICA_BASE_URL}/${seasonYear}/driverstandings.json`;
    const response = await getWithRetry(url);
    const standings = extractDriverStandingsList(response.data);

    for (const standing of standings) {
      const externalDriverId = standing?.Driver?.driverId;
      if (!externalDriverId) continue;

      const localDriver = activeDriversMap.get(externalDriverId);
      if (!localDriver) continue;

      await DriverSeasonPoint.create({
        season_year: seasonYear,
        driver_id: localDriver.id,
        position: Number(standing.position || 0),
        points: Number(standing.points || 0),
        wins: Number(standing.wins || 0),
        fetched_at: new Date(),
      });

      processedDrivers += 1;
    }

    processedSeasons += 1;
    await sleep(1200);
  }

  return {
    success: true,
    processedDrivers,
    processedSeasons,
    fromYear: SEASON_POINTS_FROM_YEAR,
    toYear: SEASON_POINTS_TO_YEAR,
  };
}

async function fullF1Sync() {
  const driversResult = await syncDrivers();
  const driverStandingsResult = await syncCurrentDriverStandings();
  const constructorStandingsResult = await syncCurrentConstructorStandings();
  const seasonPointsResult = await syncCurrentDriversSeasonPoints();

  return {
    success: true,
    drivers: driversResult,
    driverStandings: driverStandingsResult,
    constructorStandings: constructorStandingsResult,
    seasonPoints: seasonPointsResult,
  };
}

module.exports = {
  syncDrivers,
  syncCurrentDriverStandings,
  syncCurrentConstructorStandings,
  syncCurrentDriversSeasonPoints,
  fullF1Sync,
};