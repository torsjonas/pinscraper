var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

var S3 = require('aws-sdk/clients/s3');
var s3 = new S3({
  apiVersion: '2006-03-01',
  region: 'us-east-1',
  params: {
    Bucket: process.env.PINSCRAPER_BUCKET_NAME
  }
});

function createCacheKey(key) {
  return `cache-${key}`;
}

function getRecipients () {
  var params = {
    Key: 'recipients.json'
  };

  return s3.getObject(params).promise()
    .then(response => JSON.parse(response.Body.toString('utf-8')));
}

function exists (key) {
  var params = {
    Key: createCacheKey(key)
  };

  return s3.headObject(params).promise()
    .then(response => true)
    .catch(err => false);
}

function put (key, value) {
  var params = {
    Key: createCacheKey(key),
    Body: value
  };

  return s3.putObject(params).promise();
}

module.exports = {
  getRecipients,
  exists,
  put
};