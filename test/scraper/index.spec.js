/* eslint-env mocha */

var sinon = require('sinon');
var assert = require('chai').assert;
var scraper = require('../../src/scraper');
var flippermarkt = require('../../src/scraper/scrapers/flippermarkt');
var sfss = require('../../src/scraper/scrapers/svenskaflippersallskapet');
var sendgrid = require('../../src/resources/sendgrid');
var matchCache = require('../../src/resources/matchCache');

describe('scraper', function () {
  afterEach(function () {
    flippermarkt.scrape.restore && flippermarkt.scrape.restore();
    sfss.scrape.restore && sfss.scrape.restore();
    sendgrid.sendMatches.restore && sendgrid.sendMatches.restore();
    matchCache.getNewMatches.restore && matchCache.getNewMatches.restore();
    matchCache.put.restore && matchCache.put.restore();
  });

  describe('run', function () {
    it('should call the cache functions getNewMatches and put to cache new matches', function () {
      var recipients = [
        {
          email: 'your@email.com',
          pins: [
            {name: 'Attack From Mars'}
          ]
        }
      ];

      var matches = [
        {pin: {name: 'Attack From Mars'}}
      ];

      var flippermarktScrapeSpy = sinon.stub(flippermarkt, 'scrape').callsFake(() => Promise.resolve(matches));
      var sfssScrapeSpy = sinon.stub(sfss, 'scrape').callsFake(() => Promise.resolve([]));
      var sendMatchesSpy = sinon.stub(sendgrid, 'sendMatches').callsFake(() => Promise.resolve());
      var getNewMatchesSpy = sinon.stub(matchCache, 'getNewMatches').callsFake(() => Promise.resolve(matches));
      var putSpy = sinon.stub(matchCache, 'put').callsFake(() => Promise.resolve());

      return scraper.run(recipients, matchCache)
        .then(() => {
          assert.isTrue(flippermarktScrapeSpy.calledOnce);
          assert.isTrue(sfssScrapeSpy.calledOnce);
          assert.isTrue(getNewMatchesSpy.calledOnce);
          assert.isTrue(sendMatchesSpy.calledOnce);
          assert.isTrue(putSpy.calledOnce);
        });
    });
  });

  describe('_hasPin', function () {
    it('should return true when name is equal', function () {
      var pin = {name: 'Attack From Mars'};
      var recipient = {
        pins: [{name: 'Attack From Mars'}]
      };

      assert.isTrue(scraper._hasPin(recipient, pin));
    });

    it('should return true when abbreviation is equal', function () {
      var pin = {abbreviation: 'AFM'};
      var recipient = {
        pins: [{abbreviation: 'AFM'}]
      };

      assert.isTrue(scraper._hasPin(recipient, pin));
    });

    it('should return false when recipient has no pins', function () {
      var pin = {abbreviation: 'AFM'};
      var recipient = {
        pins: []
      };

      assert.isFalse(scraper._hasPin(recipient, pin));
    });

    it('should return false when neither name nor abbreviation matches', function () {
      var pin = {name: 'Attack From Mars', abbreviation: 'AFM'};
      var recipient = {
        pins: [{name: 'Monster Bash', abbreviation: 'MB'}]
      };

      assert.isFalse(scraper._hasPin(recipient, pin));
    });
  });

  describe('_createRecipientMatches', function () {
    it('should return matches with recipient and pins that match the scrape results', function () {
      var recipient1 = {
        email: 'some@email.com',
        pins: [
          {name: 'Attack From Mars'},
          {name: 'Flash Gordon'}
        ]
      };

      var recipient2 = {
        email: 'another@email.com',
        pins: [{name: 'Monster Bash'}]
      };

      var recipients = [recipient1, recipient2];
      var scrapeMatches = [
        {
          pin: {
            name: 'Attack From Mars'
          }
        }
      ];

      var expected = [
        {
          recipient: recipient1,
          matches: [
            {
              pin: {
                name: 'Attack From Mars'
              }
            }
          ]
        }
      ];

      var recipientMatches = scraper._createRecipientMatches(recipients, scrapeMatches);
      assert.deepEqual(recipientMatches, expected);
    });
  });

  describe('_scrape', function () {
    it('should concatenate scrape results from all scrapers', function () {
      var flippermarktResults = [
        {
          pin: {
            name: 'Attack From Mars'
          }
        },
        {
          pin: {
            name: 'Monster Bash'
          }
        }
      ];

      var sfssResults = [
        {
          pin: {
            name: 'Flash Gordon'
          }
        }
      ];

      var expected = flippermarktResults.concat(sfssResults);

      sinon.stub(flippermarkt, 'scrape').callsFake(() => Promise.resolve(flippermarktResults));
      sinon.stub(sfss, 'scrape').callsFake(() => Promise.resolve(sfssResults));

      return scraper._scrape([])
        .then(scrapeResults => {
          assert.deepEqual(scrapeResults, expected);
        });
    });
  });
});
