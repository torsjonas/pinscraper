var jsonfile = require('jsonfile');
var CronJob = require('cron').CronJob;
var scrapeEmailer = require('./scrapeEmailer');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper webserver'});
var jsonObj = jsonfile.readFileSync('./recipients.json');

// Run every 6 hours
var job = new CronJob(
  '0 0 0/6 * * *',
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
