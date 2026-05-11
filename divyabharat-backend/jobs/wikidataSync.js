'use strict';

const cron = require('node-cron');
const { runImport } = require('@server/controllers/importController');

const startWikidataSync = () => {
  cron.schedule('30 20 * * *', async () => {
    console.log('[Wikidata Sync] Daily sync starting...');
    try {
      await runImport({ triggeredBy: 'cron' });
    } catch (err) {
      console.error('[Wikidata Sync] Daily sync failed:', err.message);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('[Wikidata Sync] Daily sync scheduled for 02:00 AM IST');
};

module.exports = { startWikidataSync };