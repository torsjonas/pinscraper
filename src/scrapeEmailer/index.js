var Promise = require('bluebird');
var scraper = require('./scrape');
var nodemailer = require('./nodemailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper scrapeEmailer'});
var s3 = require('../resources/s3');

var toCacheKey = function (match, recipient) {
  if (!match || !match.matchUri || !recipient || !recipient.email) {
    throw new Error('match.matchUri and recipient.email required');
  }

  return encodeURIComponent(recipient.email + ':' + match.matchUri);
};

var filterAlreadySentMatches = function (scrapeMatches, recipient) {
  return Promise.filter(scrapeMatches, match => {
    var cacheKey = toCacheKey(match, recipient);

    return s3.exists(cacheKey)
      .then(exists => !exists);
  });
};

var cacheMatches = function (matches, recipient) {
  return Promise.map(matches, match => {
    var cacheKey = toCacheKey(match, recipient);
    return s3.put(cacheKey, 'yep');
  })
    .then(() => {
      log.info({ event: 'cache-matches-done' });
    });
};

var formatPin = function (pin) {
  if (!pin || (!pin.name && !pin.abbreviation)) {
    throw new Error('pin whith property name and/or abbreviation expected');
  }

  if (pin.name) {
    if (pin.abbreviation) {
      return `${pin.name} (${pin.abbreviation})`;
    } else {
      return pin.name;
    }
  } else {
    if (pin.abbreviation) {
      return pin.abbreviation;
    }
  }
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

              var foundPins = matches.map(match => formatPin(match.pin)).join(', ');
              var text = matches.map(match => `${formatPin(match.pin)}: ${match.matchUri}\n`);

              return nodemailer.sendMail({
                to: recipient.email,
                subject: `Pinscraper: ${foundPins}`,
                text
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
      console.error(err);
      log.error({ event: 'pin-scrape-error', message: err.message, err });
    });
  }
};
