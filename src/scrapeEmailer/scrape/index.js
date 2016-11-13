var flippermarkt = require('./flippermarkt');
var sfss = require('./svenskaflippersallskapet');
var scrapers = [flippermarkt, sfss];

var scrape = function (pins) {
  return Promise.all(scrapers.map(scraper => scraper.scrape(pins)))
    .then(scrapeRequests => {
      return scrapeRequests.reduce((total, scrapeMatches) => {
        return total.concat(scrapeMatches);
      }, []);
    });
};

module.exports = {
  scrape
};
