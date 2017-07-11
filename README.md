# pinscraper

Scrapes http://flippermarkt.de and http://www.svenskaflippersallskapet.com for pinball machines and sends an email to recipients subscribing to machines.
The same link will not be sent to each recipient more than once.
Can be run as a cron job or lambda scheduled job.

AWS S3 is used for caching of already sent forum threads to prevent duplicates.
It is also the place of storage of recipients.json.
The scraper fetches recipients json file from an S3 bucket having content as the below example:
```
{
  "recipients": [
    { "email": "your@email.com", "pins": [{ "name":"Alien Star" }, { "name":"Attack From Mars", "abbreviation":"AFM" }] }
  ]
}
```

For AWS access, the following environment variables are expected:
```
PINSCRAPER_BUCKET_NAME
ACCESS_KEY_ID
SECRET_ACCESS_KEY
```

Sending emails is done with nodemailer sendgrid and a sendgrid api key is expected in environment variable `SENDGRID_API_KEY`.