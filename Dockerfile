FROM oven/bun:alpine

ENV NODE_ENV=dev

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

COPY ./public ./public
COPY ./views ./views
COPY ./src ./src

RUN bun install --production

EXPOSE 8000

CMD [ "bun", "dev" ]
