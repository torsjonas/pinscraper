/* eslint-env mocha */

var sinon = require('sinon');
var assert = require('chai').assert;
var s3 = require('../../src/resources/s3');
var s3Client = s3._client;

describe('s3', function () {
  afterEach(function () {
    s3Client.getObject.restore && s3Client.getObject.restore();
    s3Client.putObject.restore && s3Client.putObject.restore();
    s3Client.headObject.restore && s3Client.headObject.restore();
  });

  describe('getRecipients', function () {
    it('should call aws sdk s3 method to get recipients.json', function () {
      var getObjectSpy = sinon.stub(s3Client, 'getObject').callsFake(() => ({
        promise: () => Promise.resolve({Body: '{}'})
      }));
      getObjectSpy.withArgs({
        Key: 'recipients.json'
      });

      return s3.getRecipients()
        .then(() => {
          assert.isTrue(getObjectSpy.calledOnce);
        });
    });
  });

  describe('_toCacheKey', function () {
    it('should create expected cache key', function () {
      var expectedKey = 'cache/some%40email.com%3Ahttp%3A%2F%2Furl.com';

      var match = {matchUri: 'http://url.com'};
      var recipient = {email: 'some@email.com'};

      var key = s3._toCacheKey(match, recipient);
      assert.strictEqual(key, expectedKey);
    });
  });
});
