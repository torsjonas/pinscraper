var flippermarkt = require('./flippermarkt');

var scrape = function (pins) {
  return Promise.all([flippermarkt].map(scraper => scraper.scrape(pins)))
    .then(scrapeRequests => {
      return scrapeRequests.reduce((total, scrapeMatches) => {
        return total.concat(scrapeMatches);
      }, []);
    });
};

module.exports = {
  scrape
};
