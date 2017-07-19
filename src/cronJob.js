var CronJob = require('cron').CronJob;
var scraper = require('./scraper');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper node-cron'});
var s3 = require('./resources/s3');
var matchCache = require('./resources/matchCache');

function createCron (recipients) {
  log.info({ event: 'pin-scraper-create-cron', recipients });

  // Run every hour
  return new CronJob(
    '0 0 0-23 * * *',
    function () {
      try {
        log.info({ event: 'pin-scraper-cron-start' });
        scraper.run(recipients, matchCache);
      } catch (err) {
        log.error({ event: 'pin-scraper-cron-error', err });
      }
    },
    function () {},
    true
  );
}

log.info({ event: 'pin-scraper-fetching-recipients' });
s3.getRecipients()
  .then(response => {
    createCron(response.recipients);
  })
  .catch(err => {
    log.error({
      event: 'pin-scraper-failed-to-fetch-recipients',
      err
    });
  });
