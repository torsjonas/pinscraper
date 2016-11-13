FROM node:7

RUN mkdir /app
COPY package.json /app/package.json
COPY ./src /app/src

WORKDIR /app
RUN npm install

CMD ["node", "."]