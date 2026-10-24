# Posts live in web/posts/*.md and are rendered to static HTML at build time.
# Pinned to major + Alpine release so `./run-local.sh rebuild` (--pull) picks up security patches.
FROM node:24-alpine3.24 AS build
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
RUN npm run build

FROM nginx:1.30-alpine3.24-slim
# Render injects PORT; nginx's entrypoint substitutes it into the template at startup.
ENV PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/web/out /usr/share/nginx/html
EXPOSE 8080
