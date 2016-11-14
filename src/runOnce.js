var scrapeEmailer = require('./scrapeEmailer');

if (!process.argv[2]) {
  throw new Error('First argument should be of format "type:text" where type is either name or abbreviation and text is the corresponding text value to search for. E.g. "name:Attack From Mars" or "abbreviation:AFM"');
}

if (!process.argv[3]) {
  throw new Error('Second argument should be an email address for the recipient.');
}

var searchParts = process.argv[2].split(':');
var pin = {
  [searchParts[0]]: searchParts[1]
};

scrapeEmailer.run([
  { 'pins': [pin], 'email': process.argv[3] }
]);
