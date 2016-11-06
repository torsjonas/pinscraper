var Promise = require('bluebird');
var scraper = require('./scrape');
var nodemailer = require('./nodemailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper scrapeEmailer'});

module.exports = {
  run: function (recipients) {
    return Promise.mapSeries(recipients, recipient => {
      return scraper.scrape(recipient.pins)
        .then(matches => {
          if (!matches || matches.length === 0) {
            return Promise.resolve('No matches');
          }

          if (!recipient.email) {
            return Promise.resolve('No email address specified');
          }

          var foundPins = matches.map(match => match.pin).join(', ');
          var text = matches.map(match => `${match.pin}: ${match.href}`).join(', ');
          var html = `<ul>${matches.map(match => `<li>${match.pin}: ${match.href}</li>`)}</ul>`;

          return nodemailer.sendMail({
            to: recipient.email,
            subject: `Pinscraper: ${foundPins}`,
            text,
            html
          });
        })
        .then(result => {
          log.info({ event: 'scrape-done', result });
        });
    })
    .catch(err => {
      log.error({ event: 'pin-scrape-error', message: err.message, err });
    });
  }
};
