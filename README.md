# pinscraper

Scrapes http://flippermarkt.de for pinball machines and sends an email to recipients subscribing to machines.
The same link will not be sent to each recipient more than once.
A cron job reads from a recipients json file having content as the below example:
```
{
  "recipients": [
    { "email": "your@email.com", "pins": ["Alien Star", "Attack From Mars"] }
  ]
}
```

Create the recipients file at config/recipients.json.
Sending emails is done with nodemailer sendgrid and a sendgrid api key is expected in environment variable SENDGRID_API_KEY.

