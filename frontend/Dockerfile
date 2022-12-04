FROM node:lts-slim as build 

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y iputils-ping curl

RUN npm ci

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]
