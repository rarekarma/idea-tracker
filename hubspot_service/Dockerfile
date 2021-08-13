FROM node:14-alpine

WORKDIR /usr/app

COPY ./package.json ./

COPY ./yarn.lock ./

RUN yarn

COPY . .

RUN echo "copied everything over for server"

EXPOSE 8080

CMD ["yarn", "start"]