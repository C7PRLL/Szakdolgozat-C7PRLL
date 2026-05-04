import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Pilots() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [nationality, setNationality] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/drivers")
      .then((res) => {
        setDrivers(res.data || []);
      })
      .catch((err) => {
        console.error("Hiba a betöltéskor:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const nationalities = useMemo(() => {
    return [...new Set(drivers.map((d) => d.nationality).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [drivers]);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const name = (d.full_name || "").toLowerCase();

      return (
        name.includes(search.toLowerCase()) &&
        (nationality === "" || d.nationality === nationality)
      );
    });
  }, [drivers, search, nationality]);

  return (
    <div className="wrapper">
      <section className="container">
        <div className="glass-box">
          <h2>Pilóták</h2>
          <p>
            Böngéssz a Formula–1 versenyzői között név és nemzetiség alapján.
          </p>

          <div style={{ marginTop: "2em", marginBottom: "2em" }}>
            <input
              type="text"
              placeholder="Keresés név alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            >
              <option value="">Összes nemzetiség</option>
              {nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Betöltés...</p>
          ) : filtered.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Név</th>
                    <th>Nemzetiség</th>
                    <th>Születési év</th>
                    <th>Rajtszám</th>
                    <th>Részletek</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const birthYear = d.date_of_birth
                      ? d.date_of_birth.substring(0, 4)
                      : "N/A";

                    return (
                      <tr key={d.id}>
                        <td>{d.full_name}</td>
                        <td>{d.nationality || "N/A"}</td>
                        <td>{birthYear}</td>
                        <td>{d.permanent_number || "N/A"}</td>
                        <td>
                          {d.wiki_url ? (
                            <a
                              href={d.wiki_url}
                              target="_blank"
                              rel="noreferrer"
                              className="button"
                              style={{ minWidth: "unset", margin: 0, padding: "0.4em 1em" }}
                            >
                              Bővebben
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Nincs találat.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Pilots;