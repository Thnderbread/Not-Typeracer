# Fkn ngrok
FROM oven/bun:alpine

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./

RUN bun install --production

USER bun

COPY --chown=bun:bun ./public ./public
COPY --chown=bun:bun ./views ./views
COPY --chown=bun:bun ./src ./src

ENV NODE_ENV=dev

EXPOSE 8000

CMD [ "bun", "dev" ]
