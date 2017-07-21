var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.PINSCRAPER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.PINSCRAPER_AWS_SECRET_ACCESS_KEY
});

var S3 = require('aws-sdk/clients/s3');
var s3 = new S3({
  apiVersion: '2006-03-01',
  region: 'us-east-1',
  params: {
    Bucket: process.env.PINSCRAPER_AWS_BUCKET_NAME
  }
});

function getRecipients () {
  var params = {
    Key: 'recipients.json'
  };

  // JSON structure:
  // {
  //   "recipients": [
  //     { "email": "your@email.com", "pins": [{ "name":"Alien Star" }, { "name":"Attack From Mars", "abbreviation":"AFM" }] }
  //   ]
  // }
  return s3.getObject(params).promise()
    .then(response => JSON.parse(response.Body.toString('utf-8')));
}

function exists (key) {
  var params = {
    Key: key
  };

  return s3.headObject(params).promise()
    .then(() => true)
    .catch(() => false);
}

function getNewMatches (scrapeMatches, recipient) {
  var newMatches = [];
  return Promise.all(scrapeMatches, match => {
    var cacheKey = _toCacheKey(match, recipient);

    return exists(cacheKey)
      .then(exists => {
        if (!exists) {
          newMatches.push(match);
        }
      });
  })
    .then(() => {
      return newMatches;
    });
}

function putMatches (matches, recipient) {
  var putPromises = matches.map(match => {
    var key = _toCacheKey(match, recipient);
    var params = {
      Key: key,
      Body: 'match'
    };

    return s3.putObject(params).promise();
  });

  return Promise.all(putPromises);
}

function _toCacheKey (match, recipient) {
  if (!match || !match.matchUri || !recipient || !recipient.email) {
    throw new Error('match.matchUri and recipient.email required');
  }

  return 'cache/' + encodeURIComponent(recipient.email + ':' + match.matchUri);
}

module.exports = {
  getRecipients,
  putMatches,
  getNewMatches,
  _toCacheKey,
  _client: s3
};
