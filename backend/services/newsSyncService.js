const axios = require('axios');
const { NewsArticle } = require('../models');

const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

function isLikelyF1Article(article) {
  const text = [
    article?.title || '',
    article?.description || '',
    article?.content || '',
    article?.source?.name || '',
  ]
    .join(' ')
    .toLowerCase();

  const positiveKeywords = [
    'formula 1',
    'formula one',
    'grand prix',
    'fia',
    'qualifying',
    'pole position',
    'sprint',
    'paddock',
    'verstappen',
    'hamilton',
    'leclerc',
    'norris',
    'piastri',
    'russell',
    'ferrari',
    'mercedes',
    'red bull',
    'mclaren',
    'aston martin',
    'alpine',
    'williams',
    'haas',
    'sauber',
    'racing bulls'
  ];

  const negativeKeywords = [
    'kim kardashian',
    'kanye west',
    'mutual fund',
    'sip amount',
    'investment',
    'stock market',
    'crypto'
  ];

  const hasPositive = positiveKeywords.some((k) => text.includes(k));
  const hasNegative = negativeKeywords.some((k) => text.includes(k));

  return hasPositive && !hasNegative;
}

async function syncF1News() {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    throw new Error('Hiányzik a GNEWS_API_KEY a .env fájlból.');
  }

  const response = await axios.get(GNEWS_BASE_URL, {
    params: {
      q: '"Formula 1" OR "Formula One" OR "Grand Prix"',
      lang: 'en',
      in: 'title,description',
      max: 10,
      sortby: 'publishedAt',
      apikey: apiKey,
    },
  });

  const articles = response.data?.articles || [];
  const filteredArticles = articles.filter(isLikelyF1Article);

  let processed = 0;

  for (const article of filteredArticles) {
    if (!article.url || !article.title) continue;

    await NewsArticle.upsert({
      source_name: article?.source?.name || null,
      title: article.title,
      description: article.description || null,
      url: article.url,
      image_url: article.image || null,
      published_at: article.publishedAt || null,
      content_snippet: article.content || null,
      is_active: true,
      last_synced_at: new Date(),
    });

    processed += 1;
  }

  return {
    success: true,
    fetched: articles.length,
    processed,
  };
}

module.exports = { syncF1News };