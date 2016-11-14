var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'pinscraper', module: 'flippermarkt'});
var cheerio = require('cheerio');
var rp = require('request-promise');
var url = require('url');
var querystring = require('querystring');
var matchUtil = require('./matchUtil');

var baseUrl = 'http://flippermarkt.de/community/forum/';
var uri = url.resolve(baseUrl, 'forumdisplay.php?f=13');

var options = {
  uri,
  transform: function (body) {
    return cheerio.load(body);
  }
};

function keepTopicQSParameter (baseUrl, hrefAttrib) {
  var resolvedUrl = hrefAttrib ? url.resolve(baseUrl, hrefAttrib) : null;
  if (!resolvedUrl) {
    return;
  }

  var parsedUrl = url.parse(resolvedUrl);
  if (!parsedUrl || !parsedUrl.search || !parsedUrl.query) {
    return;
  }

  var parsedQs = querystring.parse(parsedUrl.query);
  if (!parsedQs || !parsedQs.t) {
    return;
  }

  var { t } = parsedQs;
  var baseHref = resolvedUrl.substring(0, resolvedUrl.indexOf(parsedUrl.search));
  return baseHref + '?' + querystring.stringify({ t });
}

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
        var aThreadTitle = $(elem).find('a[id*="thread_title"]')[0];
        var hrefText = aThreadTitle && $(aThreadTitle).text();
        if (title || hrefText) {
          pins.forEach(pin => {
            if (matchUtil.isMatch(pin, title) || matchUtil.isMatch(pin, hrefText)) {
              var hrefAttrib = aThreadTitle && aThreadTitle.attribs['href'];
              var matchUri = keepTopicQSParameter(baseUrl, hrefAttrib);

              if (matchUri) {
                matches.push({
                  site,
                  pin,
                  title,
                  hrefText,
                  matchUri
                });
              } else {
                log.error({ event: 'parse-uri-error-flippermarkt', hrefAttrib });
              }
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
