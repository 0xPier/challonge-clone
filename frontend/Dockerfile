FROM node:18-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM deps AS development

ENV NODE_ENV=development \
    PORT=3000 \
    HOST=0.0.0.0 \
    WDS_SOCKET_PORT=0

COPY . .

CMD ["npm", "start"]

FROM deps AS build

ARG REACT_APP_API_URL=http://localhost:5001/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY . .

RUN npm run build

FROM nginx:1.25-alpine AS runner

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
