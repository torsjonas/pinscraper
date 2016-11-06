var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var mailer = process.env.SENDGRID_API_KEY ? nodemailer.createTransport(
  sgTransport({auth: {api_key: process.env.SENDGRID_API_KEY}})
) : null;

module.exports = {
  sendMail: function ({ to, subject, text, html }) {
    if (!mailer) {
      return Promise.resolve('No email sent, env variable SENDGRID_API_KEY not found.');
    }

    return new Promise((resolve, reject) => {
      if (!to || !subject || !text) {
        reject('Can\'t send email. to, subject and text are required.');
      }

      var email = {
        to: [to],
        from: 'noreply@pinscraper.pinballshots.com',
        subject,
        text,
        html
      };

      mailer.sendMail(email, function (err) {
        if (err) {
          reject(err);
        }

        resolve('Successfully sent the email.');
      });
    });
  }
};
