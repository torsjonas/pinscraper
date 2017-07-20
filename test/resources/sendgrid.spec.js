/* eslint-env mocha */

var assert = require('chai').assert;
var sendgrid = require('../../src/resources/sendgrid');

describe('sendgrid', function () {
  describe('_getMailParams', function () {
    it('should return expected email text', function () {
      var recipient = {
        email: 'your@email.com',
        pins: [
          {name: 'Attack From Mars'}
        ]
      };

      var matches = [
        {
          pin: {
            name: 'Attack From Mars'
          },
          matchUri: 'http://www.flippermarkt.de/community/forum/showthread.php?t=186069'
        },
        {
          pin: {
            name: 'Monster Bash'
          },
          matchUri: 'http://www.flippermarkt.de/community/forum/showthread.php?t=186070'
        }
      ];

      var expectedText =
        'Attack From Mars: http://www.flippermarkt.de/community/forum/showthread.php?t=186069\n' +
        'Monster Bash: http://www.flippermarkt.de/community/forum/showthread.php?t=186070';
      var expectedSubject = 'Pinscraper: Attack From Mars, Monster Bash';
      var expectedTo = 'your@email.com';

      var params = sendgrid._getMailParams(matches, recipient);
      assert.strictEqual(params.text, expectedText);
      assert.strictEqual(params.subject, expectedSubject);
      assert.strictEqual(params.to, expectedTo);
    });
  });

  describe('_formatPin', function () {
    it('should return expected text for pin with name', function () {
      var pin = {
        name: 'Attack From Mars'
      };

      var expectedText = 'Attack From Mars';

      var text = sendgrid._formatPin(pin);
      assert.strictEqual(text, expectedText);
    });

    it('should return expected text for pin with abbreviation', function () {
      var pin = {
        abbreviation: 'AFM'
      };

      var expectedText = 'AFM';

      var text = sendgrid._formatPin(pin);
      assert.strictEqual(text, expectedText);
    });

    it('should return expected text for pin with name and abbreviation', function () {
      var pin = {
        name: 'Attack From Mars',
        abbreviation: 'AFM'
      };

      var expectedText = 'Attack From Mars (AFM)';

      var text = sendgrid._formatPin(pin);
      assert.strictEqual(text, expectedText);
    });
  });
});
