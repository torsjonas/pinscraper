var scraper = require('./scraper');
var matchCache = require('./resources/matchCache');

var noCache = {
  getNewMatches: (scrapeMatches, recipient) => Promise.resolve(scrapeMatches),
  put: () => Promise.resolve()
};

if (!process.argv[2]) {
  throw new Error('First argument should be the name or abbreviation of a pinball machine to search for, e.g. "Attack From Mars"');
}

if (!process.argv[3]) {
  throw new Error('Second argument should be an email address.');
}

var pin = {
  name: process.argv[2]
};

var cache = process.argv[4] === 'no-cache' ? noCache : matchCache;

var recipients = [{ 'pins': [pin], 'email': process.argv[3] }];
scraper.run(recipients, cache);
