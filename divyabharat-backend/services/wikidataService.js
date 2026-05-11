'use strict';

const axios = require('axios');

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

const CATEGORY_QUERIES = [
  { instanceOf: 'Q44539', category: 'temple' },    // Hindu temple
  { instanceOf: 'Q160742', category: 'fort' },      // fort
  { instanceOf: 'Q35509', category: 'cave' },       // cave
  { instanceOf: 'Q5753', category: 'ghat' },        // ghat
  { instanceOf: 'Q1164978', category: 'ashram' },   // ashram
  { instanceOf: 'Q697295', category: 'gurudwara' }, // gurudwara
  { instanceOf: 'Q839954', category: 'ancient_site' }, // archaeological site
  { instanceOf: 'Q3914', category: 'museum' },      // museum
];

const buildCategoryQuery = (instanceOf, limit = 500) => `
  SELECT DISTINCT ?place ?placeLabel ?placeDescription ?lat ?lng ?image ?adminLabel
  WHERE {
    ?place wdt:P31 wd:${instanceOf} .
    ?place wdt:P17 wd:Q668 .
    ?place wdt:P625 ?coord .
    BIND(geof:latitude(?coord) AS ?lat)
    BIND(geof:longitude(?coord) AS ?lng)
    OPTIONAL { ?place wdt:P18 ?image }
    OPTIONAL { ?place wdt:P131 ?admin }
    SERVICE wikibase:label {
      bd:serviceParam wikibase:language "en" .
    }
  }
  LIMIT ${limit}
`;

const querySparql = async (query) => {
  const response = await axios.get(SPARQL_ENDPOINT, {
    params: { query, format: 'json' },
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'DivyaBharat/1.0 (https://github.com/gorejuee/DivyaBharat)'
    },
    timeout: 30000
  });
  return response.data.results.bindings;
};

const parseBindings = (bindings, category) => {
  const seen = new Set();
  const places = [];

  for (const item of bindings) {
    const wikidataId = item.place?.value?.split('/').pop();
    if (!wikidataId || seen.has(wikidataId)) continue;
    seen.add(wikidataId);

    const name = item.placeLabel?.value;
    if (!name || name.startsWith('Q')) continue;

    const lat = parseFloat(item.lat?.value);
    const lng = parseFloat(item.lng?.value);
    if (isNaN(lat) || isNaN(lng)) continue;

    // validate coordinates are within India roughly
    if (lat < 6 || lat > 37 || lng < 68 || lng > 98) continue;

    const admin = item.adminLabel?.value;
    const state = (!admin || admin.startsWith('Q')) ? null : admin;

    places.push({
      wikidataId,
      name,
      description: item.placeDescription?.value || null,
      category,
      state: state || 'India',
      city: null,
      latitude: lat,
      longitude: lng,
      image_url: item.image?.value || null
    });
  }

  return places;
};

const fetchFromWikidata = async () => {
  const allPlaces = [];

  for (const { instanceOf, category } of CATEGORY_QUERIES) {
    try {
      console.log(`[Wikidata] Fetching ${category} (${instanceOf})...`);
      const query = buildCategoryQuery(instanceOf);
      const bindings = await querySparql(query);
      const places = parseBindings(bindings, category);
      console.log(`[Wikidata] Got ${places.length} ${category} places`);
      allPlaces.push(...places);

      // wait 2 seconds between queries
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[Wikidata] Failed to fetch ${category}:`, err.response?.status, err.response?.data || err.message || err);
      // continue with next category instead of failing everything
    }
  }

  return allPlaces;
};

module.exports = { fetchFromWikidata };