
FROM node:18-alpine AS builder

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci


RUN npx prisma generate


COPY . .


RUN npm run build 2>/dev/null || npx tsc


FROM node:18-alpine AS runner

WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./


CMD ["node", "dist/index.js"]
