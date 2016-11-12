var jsonfile = require('jsonfile');
var CronJob = require('cron').CronJob;
var scrapeEmailer = require('./scrapeEmailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper webserver'});
var jsonObj = jsonfile.readFileSync('./recipients.json');

log.info({ event: 'pin-scraper-create-cron' });
// Run at 3 each 6 hours every day
var job = new CronJob(
  '0 3/6 * * * *',
  function () {
    try {
      log.info({ event: 'pin-scraper-cron-start' });

      scrapeEmailer.run(jsonObj.recipients);
    } catch (err) {
      log.error({ event: 'pin-scraper-cron-error', err });
    }
  },
  function () {},
  true
);

module.exports = job;
