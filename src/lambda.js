var scrapeEmailer = require('./scrapeEmailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper webserver'});
var s3 = require('./resources/s3');

function runScrape () {
  log.info({ event: 'pin-scraper-lambda-start' });
  log.info({ event: 'pin-scraper-fetching-recipients' });
  return s3.getRecipients()
    .then(response => {
      var recipients = response.recipients;

      try {
        log.info({ event: 'pin-scraper-run-scraper' });
        return scrapeEmailer.run(recipients);
      } catch (err) {
        log.error({ event: 'pin-scraper-error', err });
      }
    })
    .catch(err => {
      log.error({ event: 'pin-scraper-failed-to-fetch-recipients' });
    });
}


exports.handler = (event, context, callback) => {
  console.log('pinscraper lambda function loaded');
  runScrape();
};