var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'svenskaflippersallskapet'});
var cheerio = require('cheerio');
var rp = require('request-promise');
var matchUtil = require('./matchUtil');

var options = {
  uri: 'http://www.svenskaflippersallskapet.com/index.php?board=7.0',
  transform: function (body) {
    return cheerio.load(body);
  }
};

function scrape (pins) {
  if (!pins) {
    return Promise.resolve([]);
  }

  var site = 'Svenska Flippersällskapet';
  log.info({ event: 'scrape', site, pins });
  return rp(options)
    .then($ => {
      var matches = [];
      $('#messageindex.tborder.topic_table tr td.subject.windowbg2 span a').each(function (i, elem) {
        var text = $(elem).text();
        if (text) {
          pins.forEach(pin => {
            if (matchUtil.isMatch(pin)) {
              var matchUri = elem.attribs['href'] || null;
              matches.push({
                site,
                pin,
                text,
                matchUri
              });
            }
          });
        }
      });

      return matches;
    })
    .catch(err => {
      log.error({ event: 'scrape-error-svenskaflippersallskapet', err, message: err.message });
      return [];
    });
}

module.exports = {
  scrape
};
