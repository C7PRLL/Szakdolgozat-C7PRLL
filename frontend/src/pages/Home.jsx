import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <section id="banner" className="parallax-section">
        <div className="glass-box">
          <header>
            <h2>F1 Akadémia</h2>
            <p>Ahol a sebesség, a szenvedély<br /> és a történelem találkozik.</p>
          </header>
        </div>
      </section>

      <section id="one" className="parallax-section">
        <div className="glass-box">
          <div className="spotlight-content">
            <header>
              <h2>A Formula–1 Aranykora</h2>
              <p>1950 - 2026</p>
            </header>
            <p>Merülj el a sportág gyökereiben, és fedezd fel, hogyan vált a világ legizgalmasabb versenysorozatává!</p>
          </div>
        </div>
      </section>

      <section id="two" className="parallax-section">
        <div className="glass-box">
          <div className="spotlight-content">
            <header>
              <h2>Legendák nyomában</h2>
              <p>Sennától Verstappenig</p>
            </header>
            <p>Csatlakozz az F1 Akadémiához, és ismerd meg a hősök útját a csúcsig.</p>
            <ul className="actions">
              <Link to="/register" className="button primary">Regisztráció</Link>
            </ul>
          </div>
        </div>
      </section>

      <section id="three" className="parallax-section">
        <div className="glass-box container">
          <header>
            <h2>Funkciók</h2>
            <p>Fedezd fel az adatbázist</p>
          </header>
          
          <div className="features-grid">
            <div className="feature-box">
              <h3>Pilóták</h3>
              <p>Részletes adatbázis versenyzőkről.</p>
              <Link to="/pilots" className="button small">Böngészés</Link>
            </div>
            <div className="feature-box">
              <h3>Statisztikák</h3>
              <p>Látványos statisztikák.</p>
              <Link to="/statistics" className="button small">Megtekintés</Link>
            </div>
            <div className="feature-box">
              <h3>Időpontok</h3>
              <p>Foglalj helyet a pályán.</p>
              <Link to="/booking" className="button small">Foglalás</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;