function isMatch (pin, text) {
  return nameIsMatch(pin.name, text) || abbreviationIsMatch(pin.abbreviation, text);
}

function nameIsMatch (name, text) {
  return name && text && text.toLowerCase().indexOf(name.toLowerCase()) !== -1;
}

function abbreviationIsMatch (abbreviation, text) {
  return abbreviation && text && text.indexOf(abbreviation) !== -1;
}

module.exports = {
  isMatch
};
