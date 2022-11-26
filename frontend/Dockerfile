FROM node:lts-slim as build 

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "dev" ]
