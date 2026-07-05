FROM node:22-alpine

ENV SHELL=/bin/sh

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "watch"]
