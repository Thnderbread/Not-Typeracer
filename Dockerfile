# Fkn ngrok
FROM oven/bun:alpine

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

COPY ./public ./public
COPY ./views ./views
COPY ./src ./src

RUN bun install --production

ENV NODE_ENV=dev

CMD [ "bun", "dev" ]
