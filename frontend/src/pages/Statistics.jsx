import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DRIVER_COLORS = [
  '#e63946',
  '#3a86ff',
  '#2a9d8f',
  '#f4a261',
  '#8338ec',
  '#ff006e',
  '#43aa8b',
  '#fb5607',
  '#8ecae6',
  '#f94144',
  '#90be6d',
  '#f8961e',
  '#4d908e',
  '#b5179e',
  '#588157',
  '#bc4749',
  '#277da1',
  '#f3722c',
  '#6a4c93',
  '#577590',
  '#1d3557',
  '#264653',
];

function Statistics() {
  const [seasonPoints, setSeasonPoints] = useState([]);
  const [dnfStats, setDnfStats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dnfLoading, setDnfLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [dnfErrorMessage, setDnfErrorMessage] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setDnfLoading(true);
        setErrorMessage('');
        setDnfErrorMessage('');

        const [pointsRes, dnfRes] = await Promise.all([
          axios.get(
            'http://localhost:5000/api/drivers/statistics/current-points'
          ),
          axios.get(
            'http://localhost:5000/api/drivers/statistics/dnf-last-five-years'
          ),
        ]);

        setSeasonPoints(pointsRes.data || []);
        setDnfStats(dnfRes.data || []);
      } catch (error) {
        console.error('Hiba a statisztikai adatok lekérésekor:', error);

        if (error?.response?.status === 409) {
          setErrorMessage(
            'A statisztikai adatok még nincsenek szinkronizálva. Előbb futtasd a /api/sync/season-points végpontot.'
          );

          setDnfErrorMessage(
            'A DNF statisztikához előbb szükség van az aktív pilóták szinkronizálására.'
          );
        } else {
          setErrorMessage(
            'Nem sikerült betölteni a pontstatisztikai adatokat.'
          );

          setDnfErrorMessage(
            'Nem sikerült betölteni a DNF statisztikai adatokat.'
          );
        }
      } finally {
        setLoading(false);
        setDnfLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const pointsChartData = useMemo(() => {
    const seasons = [
      ...new Set(seasonPoints.map((item) => item.season_year)),
    ].sort((a, b) => a - b);

    const drivers = [
      ...new Set(
        seasonPoints.map((item) => item.driver?.full_name).filter(Boolean)
      ),
    ];

    const datasets = drivers.map((driverName, index) => {
      const color = DRIVER_COLORS[index % DRIVER_COLORS.length];

      return {
        label: driverName,
        data: seasons.map((season) => {
          const entry = seasonPoints.find(
            (item) =>
              item.season_year === season &&
              item.driver?.full_name === driverName
          );

          return entry ? entry.points : null;
        }),
        borderColor: color,
        backgroundColor: color,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        spanGaps: true,
        tension: 0.25,
      };
    });

    return {
      labels: seasons,
      datasets,
    };
  }, [seasonPoints]);

  const dnfChartData = useMemo(() => {
    const seasons = [...new Set(dnfStats.map((item) => item.season_year))].sort(
      (a, b) => a - b
    );

    const drivers = [
      ...new Set(
        dnfStats.map((item) => item.driver?.full_name).filter(Boolean)
      ),
    ];

    const datasets = drivers.map((driverName, index) => {
      const color = DRIVER_COLORS[index % DRIVER_COLORS.length];

      return {
        label: driverName,
        data: seasons.map((season) => {
          const entry = dnfStats.find(
            (item) =>
              item.season_year === season &&
              item.driver?.full_name === driverName
          );

          return entry ? entry.dnf_count : 0;
        }),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      };
    });

    return {
      labels: seasons,
      datasets,
    };
  }, [dnfStats]);

  const pointsChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#ffffff',
            boxWidth: 24,
            padding: 12,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: 'Jelenlegi F1 pilóták év végi pontszámai',
          color: '#ffffff',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y ?? 0} pont`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#ffffff',
          },
          title: {
            display: true,
            text: 'Év',
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255,255,255,0.08)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff',
          },
          title: {
            display: true,
            text: 'Pontszám',
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255,255,255,0.08)',
          },
        },
      },
    }),
    []
  );

  const dnfChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#ffffff',
            boxWidth: 24,
            padding: 12,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: 'Jelenlegi F1 pilóták DNF számai az elmúlt 5 évben',
          color: '#ffffff',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y ?? 0} DNF`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#ffffff',
          },
          title: {
            display: true,
            text: 'Év',
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255,255,255,0.08)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff',
            stepSize: 1,
            precision: 0,
          },
          title: {
            display: true,
            text: 'DNF darabszám',
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255,255,255,0.08)',
          },
        },
      },
    }),
    []
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '120px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '48px',
        background: '#181922',
        color: '#ffffff',
      }}
    >
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            marginBottom: '12px',
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          Statisztikák
        </h1>

        <p
          style={{
            marginBottom: '32px',
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          A diagramok a jelenlegi Formula–1-es pilóták többéves adatait
          mutatják.
        </p>

        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
            marginBottom: '32px',
          }}
        >
          {loading && (
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>Betöltés...</p>
          )}

          {!loading && errorMessage && (
            <p
              style={{
                color: '#ff4b4b',
                fontWeight: 'bold',
              }}
            >
              {errorMessage}
            </p>
          )}

          {!loading && !errorMessage && seasonPoints.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>
              Nincs még elérhető pontstatisztikai adat.
            </p>
          )}

          {!loading && !errorMessage && seasonPoints.length > 0 && (
            <div
              style={{
                height: '520px',
              }}
            >
              <Line data={pointsChartData} options={pointsChartOptions} />
            </div>
          )}
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          }}
        >
          {dnfLoading && (
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>
              DNF adatok betöltése...
            </p>
          )}

          {!dnfLoading && dnfErrorMessage && (
            <p
              style={{
                color: '#ff4b4b',
                fontWeight: 'bold',
              }}
            >
              {dnfErrorMessage}
            </p>
          )}

          {!dnfLoading && !dnfErrorMessage && dnfStats.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>
              Nincs még elérhető DNF statisztikai adat.
            </p>
          )}

          {!dnfLoading && !dnfErrorMessage && dnfStats.length > 0 && (
            <div
              style={{
                height: '520px',
              }}
            >
              <Bar data={dnfChartData} options={dnfChartOptions} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Statistics;