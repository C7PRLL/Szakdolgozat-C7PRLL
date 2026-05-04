import { Link } from 'react-router-dom';

function Track() {
    return (
        <div id="main" className="wrapper">
            <div className="container narrow">
                
                <header className="major">
                    <h2>Gokart Pálya</h2>
                    <p>Száguldás és technika az F1 Academy aszfaltján</p>
                </header>

                {/* A PÁLYA */}
                <section className="track-block">
                    <p>
                        <strong>A 8 méter széles pálya hossza 1070 méter,</strong> amely paraméterek lehetővé teszik 
                        akár 20 gokart egyidejű biztonságos versenyeztetését is. A vonalvezetés során törekedtünk a változatosságra: 
                        gyors egyenesek és technikás lassú kanyarok váltják egymást.
                    </p>
                    <div className="track-img-wrap">
                        <img src="/images/palya.png" alt="Pálya felülnézet" />
                    </div>
                </section>

                {/* PITLANE */}
                <section className="track-block">
                    <h3>Boxutca és szerviz</h3>
                    <p>
                        A boxutca kialakításánál a gyorsaság és a biztonság volt a fő szempont. 
                        Modern indítóállások és képzett személyzet várja a pilótákat a futamok közötti váltásoknál.
                    </p>
                    <div className="track-img-wrap">
                        <img src="/images/pitlane.png" alt="Pitlane" />
                    </div>
                </section>

                {/*TELEMETRIA */}
                <section className="track-block">
                    <h3>Profi időmérés és telemetria</h3>
                    <p>
                        Nálunk nem csak körözhetsz: minden másodpercedet mérjük. Kijelzőinken valós időben követheted 
                        a részidőidet, a futam végén pedig részletes elemzést kapsz a teljesítményedről.
                    </p>
                    <div className="track-img-wrap">
                        <img src="/images/telemetria.png" alt="Telemetriai kijelzők" />
                    </div>
                </section>

                {/*  BÜFÉ */}
                <section className="track-block">
                    <h3>Pihenés a futamok után</h3>
                    <p>
                        A fárasztó versenyzés után várunk büfénkben, ahol kényelmes környezetben beszélhetitek át 
                        a leggyorsabb köröket egy kávé vagy hűsítő mellett.
                    </p>
                    <div className="track-img-wrap">
                        <img src="/images/bufe.png" alt="Büfé" />
                    </div>
                </section>

                {/* FOGLALÁS GOMB */}
                <div style={{ textAlign: 'center', marginTop: '2em' }}>
                    <Link to="/booking" className="button primary">
                        Időpontot foglalok
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Track;