FROM node:7

RUN mkdir /app
COPY package.json /app/package.json
COPY ./src /app/src
COPY ./recipients.json /app/recipients.json

WORKDIR /app
RUN npm install

CMD ["node", "."]