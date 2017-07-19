#!/bin/sh

# Build, zip and upload the Lambda function with its dependencies to AWS
echo "Pruning npm dev dependencies"
npm prune --production
echo "Cleaning build dir"
rm -rf build
echo "Copying resources to build dir"
mkdir build
cp -r ./src/resources build/resources
cp -r ./src/scraper build/scraper
cp -r ./src/utils build/utils
cp -r ./node_modules build
cp ./src/lambda.js build/index.js
echo "Zipping build dir to pinscraper.zip"
cd build && zip -r pinscraper.zip ./* && cd ..
echo "Updating lambda function (step 1 of 2): upload zip to pinscraper S3 bucket"
aws s3 cp ./build/pinscraper.zip s3://pinscraper/pinscraper.zip
echo "Updating lambda function (step 2 of 2): update lambda function from pinscraper S3 bucket"
aws lambda update-function-code --function-name 'pinscraper' --s3-bucket pinscraper --s3-key pinscraper.zip
