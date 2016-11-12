var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'flippermarkt'});
var Nightmare = require('nightmare');
var nightmare = Nightmare();

function scrape (pins) {
  if (!pins) {
    return Promise.resolve([]);
  }

  var site = 'Flippermarkt';
  log.info({ event: 'scrape', site, pins });
  return nightmare
    .goto('http://flippermarkt.de/community/forum/forumdisplay.php?f=13')
    .wait('#threadbits_forum_13')
    .evaluate(function (pins) {
      var matches = [];
      var elems = document.querySelectorAll('#threadbits_forum_13 tr td[id*="td_threadtitle"]');
      for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        var title = elem && elem.title;
        var elemHref = elem.querySelector('a[id*="thread_title"]');
        var hrefText = elemHref && elemHref.innerHTML;
        if (title || hrefText) {
          pins.forEach(pin => {
            if (title && title.toLowerCase().indexOf(pin.toLowerCase()) !== -1 ||
                hrefText && hrefText.toLowerCase().indexOf(pin.toLowerCase()) !== -1) {
              var a = elem.querySelector('a');
              matches.push({
                pin,
                title,
                hrefText,
                href: a && a.href
              });
            }
          });
        }
      }

      return matches;
    }, pins)
    .end()
    .then(matches => {
      matches.forEach(match => {
        match.site = site;
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
