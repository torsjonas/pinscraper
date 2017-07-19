# pinscraper

Pinscraper scrapes the web sites http://flippermarkt.de and http://www.svenskaflippersallskapet.com in search of for sale pinball machines, and sends an email to subscribers.

Can be run as a node-cron job or AWS lambda function.

An AWS S3 bucket is used for storing the subscriptions. The bucket is also used as a cache of already sent pinball ads to prevent duplicate emails.

For AWS S3 access, the following environment variables are expected:
```
PINSCRAPER_AWS_BUCKET_NAME
PINSCRAPER_AWS_ACCESS_KEY_ID
PINSCRAPER_AWS_SECRET_ACCESS_KEY
```

Sending emails is done with sendgrid and an api key is expected in environment variable `SENDGRID_API_KEY`.

**Installation (local)**:
1. `npm install`
To start a node-cron job:
2. `node .`

To upload a zip to AWS S3 and update an existing lambda function to use that uploaded zip, you need the aws cli.
Run `aws configure` and specify credentials and region with lambda and S3 access.
Run `./deploy-to-aws.sh`

**Installation (Docker)**:
To start a node-cron job:
`docker-compose up`

**Run a one-off scrape**
To run a one off scrape for a single machine and send an email if found:
`docker-compose run node npm run runOnce "Star Trek" youremail@mail.com no-cache`

To do a dockerized upload a zip to S3 and update an existing lambda function to use that uploaded zip, you need to set host environment variables
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION
```
and then run
`docker-compose run --rm node npm run deploy`
