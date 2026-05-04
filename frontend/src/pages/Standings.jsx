import { useEffect, useState } from "react";
import axios from "axios";

function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const res = await axios.get(
          "http://localhost:5000/api/drivers/standings/drivers"
        );

        setStandings(res.data || []);
      } catch (error) {
        console.error("Hiba a tabella lekérésekor:", error);
        setErrorMessage("Nem sikerült betölteni a tabellát.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const seasonYear = standings.length > 0 ? standings[0].season_year : "";
  const round = standings.length > 0 ? standings[0].round : "";

  return (
    <div className="wrapper">
      <section className="container">
        <div className="glass-box">
          <h2>Aktuális pilóta tabella</h2>
          {seasonYear && (
            <p>
              Szezon: <strong>{seasonYear}</strong>
              {round ? <> | Forduló: <strong>{round}</strong></> : null}
            </p>
          )}

          {loading && <p>Betöltés...</p>}

          {!loading && errorMessage && <p>{errorMessage}</p>}

          {!loading && !errorMessage && standings.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Helyezés</th>
                    <th>Versenyző</th>
                    <th>Csapat</th>
                    <th>Pont</th>
                    <th>Győzelem</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((item) => (
                    <tr key={item.id}>
                      <td>{item.position}</td>
                      <td>{item.driver?.full_name || "N/A"}</td>
                      <td>{item.constructor?.name || "N/A"}</td>
                      <td>{item.points}</td>
                      <td>{item.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !errorMessage && standings.length === 0 && (
            <p>Nincs még elérhető tabella adat.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Standings;