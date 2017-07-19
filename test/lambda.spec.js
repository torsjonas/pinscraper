/* eslint-env mocha */
var sinon = require('sinon');
var assert = require('chai').assert;
var s3 = require('../src/resources/s3');
var scraper = require('../src/scraper');
var handler = require('../src/lambda').handler;

describe('handler', function () {
  afterEach(function () {
    if (s3.getRecipients.restore) {
      s3.getRecipients.restore();
    }

    if (scraper.run.restore) {
      scraper.run.restore();
    }
  });

  it('should call lambda callback after successful run', function (done) {
    var callback = (err, message) => {
      assert.isNull(err);
      assert.strictEqual(message, 'Scrape done!');
      done();
    };

    sinon.stub(s3, 'getRecipients').callsFake(() => Promise.resolve([]));
    sinon.stub(scraper, 'run').callsFake(() => Promise.resolve());
    handler({}, {}, callback);
  });

  it('should call lambda callback with error after failed to fetch recipients', function (done) {
    var callback = (err) => {
      assert.strictEqual(err.message, 'Pinscraper failed to fetch recipients');
      done();
    };

    sinon.stub(s3, 'getRecipients').callsFake(() => Promise.reject(new Error('fail')));
    handler({}, {}, callback);
  });

  it('should call lambda callback with error after failed scrape run', function (done) {
    var callback = (err) => {
      assert.strictEqual(err.message, 'Pinscraper error');
      done();
    };

    sinon.stub(s3, 'getRecipients').callsFake(() => Promise.resolve([]));
    sinon.stub(scraper, 'run').callsFake(() => Promise.reject(new Error('fail')));
    handler({}, {}, callback);
  });
});
