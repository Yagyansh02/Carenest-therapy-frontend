# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Use BuildKit cache mount so npm packages are cached across builds
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund

COPY . .

# Build args for Vite env vars (injected at build time)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_ENV=production
ARG VITE_APP_NAME=CareNest
ARG VITE_APP_VERSION=1.0.0
ARG VITE_TOKEN_REFRESH_THRESHOLD=300000
ARG VITE_TOKEN_STORAGE_KEY=carenest_auth
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_ENABLE_ERROR_TRACKING=false

RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env && \
    echo "VITE_ENV=${VITE_ENV}" >> .env && \
    echo "VITE_APP_NAME=${VITE_APP_NAME}" >> .env && \
    echo "VITE_APP_VERSION=${VITE_APP_VERSION}" >> .env && \
    echo "VITE_TOKEN_REFRESH_THRESHOLD=${VITE_TOKEN_REFRESH_THRESHOLD}" >> .env && \
    echo "VITE_TOKEN_STORAGE_KEY=${VITE_TOKEN_STORAGE_KEY}" >> .env && \
    echo "VITE_ENABLE_ANALYTICS=${VITE_ENABLE_ANALYTICS}" >> .env && \
    echo "VITE_ENABLE_ERROR_TRACKING=${VITE_ENABLE_ERROR_TRACKING}" >> .env

RUN npm run build

# ──────────────────────────────────────────────
# Stage 2 – Serve with Nginx
# ──────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
