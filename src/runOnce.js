var scrapeEmailer = require('./scrapeEmailer');

if (!process.argv[2]) {
  throw new Error('First argument should be a comma separated list of pins to search for.');
}

if (!process.argv[3]) {
  throw new Error('Second argument should be an email address for the recipient.');
}

scrapeEmailer.run([
  { 'pins': [process.argv[2]], 'email': process.argv[3] }
]);
