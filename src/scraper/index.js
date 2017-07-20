var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'scraper'});
var sendgrid = require('../resources/sendgrid');
var flippermarkt = require('./scrapers/flippermarkt');
var sfss = require('./scrapers/svenskaflippersallskapet');
var scrapers = [flippermarkt, sfss];

function _scrape (pins) {
  return Promise.all(scrapers.map(scraper => scraper.scrape(pins)))
    .then(scrapeRequests => {
      return scrapeRequests.reduce((total, scrapeMatches) => {
        return total.concat(scrapeMatches);
      }, []);
    });
}

function _hasPin (recipient, pin) {
  if (!recipient || !recipient.pins || !pin) {
    return false;
  }

  var foundPin = recipient.pins.find(recipientPin => {
    if ((recipientPin.name && recipientPin.name === pin.name) ||
      (recipientPin.abbreviation && recipientPin.abbreviation === pin.abbreviation)) {
      return true;
    }
  });

  return !!foundPin;
}

function _createRecipientMatches (recipients, scrapeMatches) {
  var allRecipientMatches = [];

  recipients.forEach(recipient => {
    var matches = [];

    scrapeMatches.forEach(match => {
      if (_hasPin(recipient, match.pin)) {
        matches.push(match);
      }
    });

    if (matches.length > 0) {
      allRecipientMatches.push({matches, recipient});
    }
  });

  return allRecipientMatches;
}

function run (recipients, matchCache) {
  var allPins = recipients.reduce((res, recipient) => res.concat(recipient.pins), []);
  if (allPins.length === 0) {
    return Promise.resolve('No pin subscriptions');
  }

  return _scrape(allPins)
    .then(scrapeMatches => {
      log.info({ event: 'scrape-done', scrapeMatches });

      if (!scrapeMatches || scrapeMatches.length === 0) {
        return Promise.resolve('No matches');
      }

      var recipientMatches = _createRecipientMatches(recipients, scrapeMatches);
      var getNewMatchesPromises = recipientMatches.map(({matches, recipient}) => {
        // filter out matches for which we have already sent a message to the recipient
        return matchCache.getNewMatches(matches, recipient)
          .then(newMatches => ({
            recipient,
            newMatches
          }));
      });

      return Promise.all(getNewMatchesPromises)
        .then(results => {
          var sendPromises = results.map(({recipient, newMatches}) => {
            if (!newMatches || newMatches.length === 0) {
              return Promise.resolve('All found matches have already been sent');
            }

            return sendgrid.sendMatches(newMatches, recipient)
              .then(result => {
                log.info({ event: 'email-sent', result });

                // cache the new matches so we won't send them again.
                return matchCache.put(newMatches, recipient)
                  .then(() => {
                    log.info({ event: 'match-cached' });
                  });
              });
          });

          return Promise.all(sendPromises);
        });
    })
    .catch(err => {
      log.error({ event: 'scrape-error', message: err.message, err });
    });
}

module.exports = {
  run,
  _scrape,
  _hasPin,
  _createRecipientMatches
};
