FROM node:20-alpine3.19 AS builder

RUN apk update && apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine3.19

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

CMD ["npm", "start"]
