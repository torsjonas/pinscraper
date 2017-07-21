var scraper = require('./scraper');
var s3 = require('./resources/s3');

var noCache = {
  getNewMatches: (scrapeMatches, recipient) => Promise.resolve(scrapeMatches),
  putMatches: () => Promise.resolve()
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

var cache = process.argv[4] === 'no-cache' ? noCache : s3;

var recipients = [{ 'pins': [pin], 'email': process.argv[3] }];
scraper.run(recipients, cache);
