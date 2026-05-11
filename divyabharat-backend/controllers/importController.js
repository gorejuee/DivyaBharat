'use strict';

const { Place } = require('@server/db');
const { fetchFromWikidata } = require('@server/services/wikidataService');

const runImport = async ({ triggeredBy = 'manual' } = {}) => {
  console.log(`[Wikidata Import] Starting - triggered by: ${triggeredBy}`);

  const places = await fetchFromWikidata();
  console.log(`[Wikidata Import] Fetched ${places.length} total places from Wikidata`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const place of places) {
    try {
      const existing = await Place.unscoped().findOne({
        where: { wikidata_id: place.wikidataId },
        attributes: ['id', 'source', 'wikidata_id']
      });

      if (!existing) {
        await Place.create({
          name: place.name,
          description: place.description,
          category: place.category,
          state: place.state,
          city: place.city,
          latitude: place.latitude,
          longitude: place.longitude,
          image_url: place.image_url,
          status: 'approved',
          source: 'wikidata',
          wikidata_id: place.wikidataId
        });
        inserted++;
      } else if (existing.source === 'wikidata') {
        await Place.unscoped().update(
          {
            name: place.name,
            description: place.description,
            category: place.category,
            state: place.state,
            city: place.city,
            latitude: place.latitude,
            longitude: place.longitude,
            image_url: place.image_url
          },
          { where: { id: existing.id } }
        );
        updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`[Wikidata Import] Error on ${place.wikidataId}:`, err.message);
      errors++;
    }
  }

  const summary = { inserted, updated, skipped, errors, total: places.length };
  console.log(`[Wikidata Import] Done —`, summary);
  return summary;
};

const triggerImport = async (req, res) => {
  try {
    const summary = await runImport({ triggeredBy: 'admin' });
    res.json({ message: 'Wikidata import completed.', summary });
  } catch (err) {
    console.error('[Wikidata Import] Failed:', err.message);
    console.error('[Wikidata Import] Full error:', err);
    res.status(500).json({ message: 'Import failed.', error: err.message });
  }
};

module.exports = { runImport, triggerImport };