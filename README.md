# pinscraper

Scrapes http://flippermarkt.de for pinball machines and sends an email to recipients subscribing to machines.
A cron job reads from a file recipients.json in the root directory having content as the below example:
```
{
  "recipients": [
    { "email": "your@email.com", "pins": ["Alien Star", "Attack From Mars"] }
  ]
}
```
