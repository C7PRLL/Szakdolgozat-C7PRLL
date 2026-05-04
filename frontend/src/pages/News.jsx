import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const ITEMS_PER_LOAD = 10;

function News() {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const res = await axios.get('http://localhost:5000/api/news');
        setArticles(res.data || []);
      } catch (error) {
        console.error('Hiba a hírek betöltésekor:', error);
        setErrorMessage('Nem sikerült betölteni a híreket.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const visibleArticles = useMemo(() => {
    return articles.slice(0, visibleCount);
  }, [articles, visibleCount]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (visibleCount >= articles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        setLoadingMore(true);

        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_LOAD, articles.length));
          setLoadingMore(false);
        }, 300);
      },
      {
        root: null,
        rootMargin: '150px',
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [articles.length, visibleCount]);

  return (
    <div className="wrapper">
      <section className="container">
        <div className="glass-box">
          <h2>Forma–1 hírek</h2>
          <p>A legfrissebb hírek az adatbázisból, időrendben.</p>

          {loading && <p>Betöltés...</p>}

          {!loading && errorMessage && <p>{errorMessage}</p>}

          {!loading && !errorMessage && visibleArticles.length === 0 && (
            <p>Nincs elérhető hír.</p>
          )}

          {!loading && !errorMessage && visibleArticles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              {visibleArticles.map((article) => {
                const published = article.published_at
                  ? new Date(article.published_at).toLocaleString('hu-HU')
                  : 'Nincs dátum';

                return (
                  <article
                    key={article.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'stretch',
                      padding: '16px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      style={{
                        flex: '0 0 220px',
                        maxWidth: '220px',
                      }}
                    >
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '140px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#ccc',
                            fontSize: '14px',
                          }}
                        >
                          Nincs kép
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
                        {article.title}
                      </h3>

                      <p style={{ marginTop: 0, marginBottom: '10px', opacity: 0.8 }}>
                        <strong>Forrás:</strong> {article.source_name || 'Ismeretlen'} |{' '}
                        <strong>Dátum:</strong> {published}
                      </p>

                      <p style={{ marginTop: 0, marginBottom: '14px', lineHeight: 1.6 }}>
                        {article.description || article.content_snippet || 'Nincs leírás.'}
                      </p>

                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="button"
                          style={{ display: 'inline-block' }}
                        >
                          Tovább a cikkhez
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}

              {visibleCount < articles.length && (
                <div
                  ref={loadMoreRef}
                  style={{
                    textAlign: 'center',
                    padding: '16px',
                    opacity: 0.8,
                  }}
                >
                  {loadingMore ? 'További hírek betöltése...' : 'Görgess lejjebb a további hírekért'}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default News;