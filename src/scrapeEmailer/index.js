var Promise = require('bluebird');
var scraper = require('./scrape');
var nodemailer = require('./nodemailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper scrapeEmailer'});
var cacheManager = require('cache-manager');
// cache matches per recipient for one year
var oneYear = 60 * 60 * 24 * 7 * 4 * 12;
var memoryCache = cacheManager.caching({ store: 'memory', max: 1000000, ttl: oneYear });

var toCacheKey = function (match, recipient) {
  if (!match || !match.matchUri || !recipient || !recipient.email) {
    throw new Error('match.matchUri and recipient.email required');
  }

  return recipient.email + ':' + match.matchUri;
};

var filterAlreadySentMatches = function (scrapeMatches, recipient) {
  return Promise.filter(scrapeMatches, match => {
    const cacheKey = toCacheKey(match, recipient);
    return memoryCache.get(cacheKey)
      .then(cachedValue => {
        return cachedValue === undefined;
      });
  });
};

var cacheMatches = function (matches, recipient) {
  return Promise.map(matches, match => {
    const cacheKey = toCacheKey(match, recipient);
    return memoryCache.set(cacheKey, true);
  })
    .then(() => {
      log.info({ event: 'cache-matches-done' });
    });
};

module.exports = {
  run: function (recipients) {
    return Promise.mapSeries(recipients, recipient => {
      return scraper.scrape(recipient.pins)
        .then(scrapeMatches => {
          log.info({ event: 'scrape-done', scrapeMatches });

          if (!scrapeMatches || scrapeMatches.length === 0) {
            return Promise.resolve('No matches');
          }

          if (!recipient.email) {
            return Promise.resolve('No email address specified');
          }

          // filter out matches for which we have already sent an email to the recipient
          return filterAlreadySentMatches(scrapeMatches, recipient)
            .then(matches => {
              if (!matches || matches.length === 0) {
                log.info({ event: 'found-nothing-new' });
                return Promise.resolve('All found matches have already been sent');
              }

              var foundPins = matches.map(match => match.pin).join(', ');
              var text = matches.map(match => `${match.pin}: ${match.matchUri}`).join(', ');
              var html = `<ul>${matches.map(match => `<li>${match.pin}: ${match.matchUri}</li>`)}</ul>`;

              return nodemailer.sendMail({
                to: recipient.email,
                subject: `Pinscraper: ${foundPins}`,
                text,
                html
              })
                .then(result => {
                  log.info({ event: 'nodemailer-done', result });

                  // cache the matches so we won't email them again.
                  return cacheMatches(matches, recipient);
                });
            });
        });
    })
    .catch(err => {
      log.error({ event: 'pin-scrape-error', message: err.message, err });
    });
  }
};
