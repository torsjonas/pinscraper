var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'flippermarkt'});
var cheerio = require('cheerio');
var rp = require('request-promise');
// var Nightmare = require('nightmare');
// var nightmare = Nightmare();
var options = {
  uri: 'http://flippermarkt.de/community/forum/forumdisplay.php?f=13',
  transform: function (body) {
    return cheerio.load(body);
  }
};

function scrape (pins) {
  if (!pins) {
    return Promise.resolve([]);
  }

  var site = 'Flippermarkt';
  log.info({ event: 'scrape', site, pins });
  return rp(options)
    .then($ => {
      var matches = [];
      $('#threadbits_forum_13 tr td[id*="td_threadtitle"]').each(function (i, elem) {
        var title = elem.attribs['title'];
        var elemHref = $(elem).find('a[id*="thread_title"]');
        var hrefText = elemHref && elemHref.text();
        if (title || hrefText) {
          pins.forEach(pin => {
            if (title && title.toLowerCase().indexOf(pin.toLowerCase()) !== -1 ||
                hrefText && hrefText.toLowerCase().indexOf(pin.toLowerCase()) !== -1) {
              var a = $(elem).find('a')[0];
              matches.push({
                site,
                pin,
                title,
                hrefText,
                href: a && a.attribs['href']
              });
            }
          });
        }
      });

      return matches;
    })
    .catch(err => {
      log.error({ event: 'scrape-error-flippermarkt', err, message: err.message });
      return [];
    });
}

module.exports = {
  scrape
};
