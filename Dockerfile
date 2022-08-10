FROM node:16.13.1-alpine3.13

USER root

WORKDIR /app

COPY . ${WORKDIR}

RUN yarn

RUN yarn build

EXPOSE 3000

CMD ["yarn", "run", "start"]