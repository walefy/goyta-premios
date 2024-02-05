FROM node:20.9.0-alpine3.18

WORKDIR /app

EXPOSE 3001

COPY package*.json /app

RUN npm ci

COPY . /app

ENTRYPOINT [ "npm", "run" ]
CMD [ "dev" ]
