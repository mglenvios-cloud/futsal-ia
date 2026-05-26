const p = require('./src/services/pasionFutsalScraper');
p.scrapeAll().then(r => console.log(JSON.stringify(r))).catch(e => console.error(e.message));
