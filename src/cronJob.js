var jsonfile = require('jsonfile');
var CronJob = require('cron').CronJob;
var scrapeEmailer = require('./scrapeEmailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper webserver'});
var recipients = jsonfile.readFileSync('./config/recipients.json').recipients;
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

module.exports = job;
