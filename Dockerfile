# Production image for the admin and coach portal (https://admin.malabarchallengersfc.com).
# Vite static build served by unprivileged nginx on port 8080.
# VITE_API_BASE_URL is inlined at build time from .env.production.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY deploy/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
