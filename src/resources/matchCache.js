var s3 = require('./s3');

function toCacheKey (match, recipient) {
  if (!match || !match.matchUri || !recipient || !recipient.email) {
    throw new Error('match.matchUri and recipient.email required');
  }

  return encodeURIComponent(recipient.email + ':' + match.matchUri);
}

function getNewMatches (scrapeMatches, recipient) {
  var newMatches = [];
  return Promise.all(scrapeMatches, match => {
    var cacheKey = toCacheKey(match, recipient);

    return s3.exists(cacheKey)
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

function put (matches, recipient) {
  var putPromises = matches.map(match => {
    var cacheKey = toCacheKey(match, recipient);
    return s3.put(cacheKey, 'match');
  });

  return Promise.all(putPromises);
}

module.exports = {
  getNewMatches,
  put
};
