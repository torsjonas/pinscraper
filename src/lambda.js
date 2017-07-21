var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'lambda'});
var s3 = require('./resources/s3');
var scraper = require('./scraper');

function run (callback) {
  return Promise.resolve()
    .then(() => s3.getRecipients())
    .then(response => {
      var recipients = response.recipients;

      log.info({ event: 'pinscraper-run' });
      return scraper.run(recipients, s3)
        .then(() => {
          callback(null, 'Scrape done!');
        })
        .catch(err => {
          log.error({ event: 'pinscraper-error', err });
          callback(new Error('Pinscraper error'));
        });
    })
    .catch(err => {
      log.error({
        event: 'pinscraper-failed-to-fetch-recipients',
        err
      });
      callback(new Error('Pinscraper failed to fetch recipients'));
    });
}

exports.handler = (event, context, callback) => {
  console.log('pinscraper lambda function loaded');
  run(callback);
};
