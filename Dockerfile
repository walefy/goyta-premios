FROM node:20.9.0-alpine3.18

WORKDIR /app

COPY package*.json /app

RUN npm ci

COPY . /app

ENTRYPOINT [ "npm", "run" ]
CMD [ "dev" ]
