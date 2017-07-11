var CronJob = require('cron').CronJob;
var scrapeEmailer = require('./scrapeEmailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper webserver'});
var s3 = require('./resources/s3');

log.info({ event: 'pin-scraper-fetching-recipients' });
s3.getRecipients()
  .then(response => {
    var recipients = response.recipients;
    log.info({ event: 'pin-scraper-create-cron', recipients });

    // Run every hour
    var job = new CronJob(
      '0 0 0-23 * * *',
      function () {
        try {
          log.info({ event: 'pin-scraper-cron-start' });
          scrapeEmailer.run(recipients);
        } catch (err) {
          log.error({ event: 'pin-scraper-cron-error', err });
        }
      },
      function () {},
      true
    );
  })
  .catch(err => {
    log.error({ event: 'pin-scraper-failed-to-fetch-recipients' });
  });
