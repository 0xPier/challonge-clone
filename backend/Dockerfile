FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV PORT=5001

EXPOSE 5001

# Make startup script executable
RUN chmod +x src/scripts/docker-startup.js

CMD ["node", "src/scripts/docker-startup.js"]
