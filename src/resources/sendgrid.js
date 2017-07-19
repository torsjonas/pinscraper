var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var helper = require('sendgrid').mail;

function sendMatches (matches, recipient) {
  var foundPins = matches.map(match => formatPin(match.pin)).join(', ');
  var text = matches.map(match => `${formatPin(match.pin)}: ${match.matchUri}`).join('\n');
  var params = {
    to: recipient.email,
    subject: `Pinscraper: ${foundPins}`,
    text
  };

  return sendMail(params);
}

function formatPin (pin) {
  if (!pin || (!pin.name && !pin.abbreviation)) {
    throw new Error('pin whith property name and/or abbreviation expected');
  }

  if (pin.name) {
    if (pin.abbreviation) {
      return `${pin.name} (${pin.abbreviation})`;
    } else {
      return pin.name;
    }
  } else {
    if (pin.abbreviation) {
      return pin.abbreviation;
    }
  }
}

function sendMail ({ to, subject, text, html }) {
  if (!to || !subject || !text) {
    return Promise.reject(new Error('Can\'t send email. to, subject and text are required.'));
  }

  var fromEmail = new helper.Email('noreply@pinscraper.pinballshots.com');
  var toEmail = new helper.Email(to);
  var content = new helper.Content('text/plain', text);
  var mail = new helper.Mail(fromEmail, subject, toEmail, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  return sg.API(request);
}

module.exports = {
  sendMatches
};
