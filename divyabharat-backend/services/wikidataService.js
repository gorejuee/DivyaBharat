'use strict';

const axios = require('axios');

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

const INSTANCE_TO_CATEGORY = {
  Q44539: 'temple',
  Q842402: 'temple',
  Q1785071: 'fort',
  Q57831: 'fort',
  Q35509: 'cave',
  Q5555933: 'ghat',
  Q1010155: 'ghat',
  Q466449: 'ashram',
  Q337986: 'gurudwara',
  Q839954: 'ancient_site',
  Q33506: 'museum',
  Q16412466: 'natural_sacred',
  Q106520522: 'heritage_village'
};

const SKIP_KEYWORDS = [
  'school', 'college', 'university', 'institute', 'hospital',
  'clinic', 'bank', 'office', 'factory', 'mall', 'airport',
  'railway', 'station', 'hotel', 'resort', 'library',
  'cemetery', 'graveyard', 'church', 'cathedral', 'mosque',
  'academy', 'vidyalaya', 'vidya', 'kendra'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const buildQuery = (offset = 0, limit = 200) => `
  SELECT DISTINCT ?place ?placeLabel ?placeDescription ?lat ?lng ?image ?adminLabel ?instanceOf
  WHERE {
    VALUES ?instanceOf {
      wd:Q44539 wd:Q842402 wd:Q1785071 wd:Q57831
      wd:Q35509 wd:Q5555933 wd:Q1010155 wd:Q466449
      wd:Q337986 wd:Q839954 wd:Q33506 wd:Q16412466
      wd:Q106520522
    }
    ?place wdt:P31 ?instanceOf .
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
  OFFSET ${offset}
`;

const querySparql = async (query) => {
  const params = new URLSearchParams();
  params.append('query', query);
  params.append('format', 'json');

  const response = await axios.post(SPARQL_ENDPOINT, params, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'DivyaBharat/1.0 (https://github.com/gorejuee/DivyaBharat; divyabharat.heritage@gmail.com)'
    },
    timeout: 55000
  });

  return response.data.results.bindings;
};

const getWikimediaThumbnail = (imageUrl) => {
  if (!imageUrl) return null;
  const filename = imageUrl.split('/').pop();
  const encoded = encodeURIComponent(decodeURIComponent(filename));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=600`;
};

const parseBindings = (bindings) => {
  const places = [];

  for (const item of bindings) {
    const wikidataId = item.place?.value?.split('/').pop();
    if (!wikidataId) continue;

    const name = item.placeLabel?.value;
    if (!name || name.startsWith('Q')) continue;

    if (SKIP_KEYWORDS.some(kw => name.toLowerCase().includes(kw))) continue;

    const lat = parseFloat(item.lat?.value);
    const lng = parseFloat(item.lng?.value);
    if (isNaN(lat) || isNaN(lng)) continue;

    // validate coordinates are within India roughly
    if (lat < 6 || lat > 37 || lng < 68 || lng > 98) continue;

    const instanceOfId = item.instanceOf?.value?.split('/').pop();
    const category = INSTANCE_TO_CATEGORY[instanceOfId] || 'other';

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
      image_url: getWikimediaThumbnail(item.image?.value)
    });
  }

  return places;
};

const fetchFromWikidata = async () => {
  const allPlaces = [];
  const seen = new Set();
  const PAGE_SIZE = 200;
  let offset = 0;
  let hasMore = true;
  let consecutiveErrors = 0;

  console.log('[Wikidata] Starting paginated fetch with POST requests...');

  while (hasMore) {
    try {
      console.log(`[Wikidata] Fetching offset ${offset}...`);
      const query = buildQuery(offset, PAGE_SIZE);
      const bindings = await querySparql(query);

      if (bindings.length === 0) {
        console.log('[Wikidata] No more results - fetch complete');
        hasMore = false;
        break;
      }

      const places = parseBindings(bindings);
      const newPlaces = places.filter(p => !seen.has(p.wikidataId));
      newPlaces.forEach(p => seen.add(p.wikidataId));
      allPlaces.push(...newPlaces);

      console.log(`[Wikidata] Offset ${offset}: got ${bindings.length} raw, ${newPlaces.length} new valid places (total: ${allPlaces.length})`);

      if (bindings.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        offset += PAGE_SIZE;
        consecutiveErrors = 0;
        // 5 second pause between pages as recommended
        await sleep(5000);
      }
    } catch (err) {
      const status = err.response?.status;
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '60');

      consecutiveErrors++;
      console.error(`[Wikidata] Error at offset ${offset}: ${status || err.message}`);

      if (status === 429) {
        const waitMs = (retryAfter + 10) * 1000;
        console.log(`[Wikidata] Rate limited. Waiting ${retryAfter + 10}s as requested by Retry-After header...`);
        await sleep(waitMs);
        // retry same offset
      } else if (consecutiveErrors >= 3) {
        console.error('[Wikidata] Too many consecutive errors - stopping fetch');
        hasMore = false;
      } else {
        await sleep(10000);
      }
    }
  }

  console.log(`[Wikidata] Fetch complete - ${allPlaces.length} total valid places`);
  return allPlaces;
};

module.exports = { fetchFromWikidata };