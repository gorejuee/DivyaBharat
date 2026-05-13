'use strict';

const axios = require('axios');

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

const getWikipediaSummary = async (title) => {
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const response = await axios.get(`${WIKIPEDIA_API}/${encoded}`, {
      headers: { 'User-Agent': 'DivyaBharat/1.0 (https://github.com/gorejuee/DivyaBharat)' },
      timeout: 8000
    });

    const data = response.data;

    // only return extract if it's a real article, not a disambiguation page
    if (data.type === 'disambiguation') return null;

    return {
      extract: data.extract || null,
      thumbnail: data.thumbnail?.source || null,
      wikipediaUrl: data.content_urls?.desktop?.page || null
    };
  } catch (err) {
    return null;
  }
};

module.exports = { getWikipediaSummary };