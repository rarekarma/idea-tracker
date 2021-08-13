FROM node:14

WORKDIR /usr/app

ENV BROWSER=none

COPY package.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN echo "copied everything over for client"

EXPOSE 3000

CMD ["yarn", "start"]