FROM node:6.10-alpine

RUN addgroup pinscraper \
  && adduser -D -G pinscraper -g "pinscraper" -s /bin/sh pinscraper \
  && echo "pinscraper ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
  && mkdir -p /opt/app \
  && chown -R pinscraper:pinscraper /opt/app

RUN apk --update add python py-pip zip unzip && \
  pip install awscli

COPY ./src /opt/app/src
COPY ./package.json /opt/app/package.json
COPY ./deploy-to-aws.sh /opt/app/deploy-to-aws.sh

USER pinscraper

WORKDIR /opt/app
RUN npm install

CMD ["node", "."]
