#!/bin/bash
set -euo pipefail

ENV="${1:-dev}"

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

COMPOSE_FILE="docker-compose.yml"
if [[ "$ENV" == "prod" ]]; then
  COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "Building frontend..."
npm ci
npm run build

echo "Starting Docker Compose ($ENV)..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -fsS "http://localhost/api/health" >/dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  sleep 1
done

echo "Deployment complete."
if [[ "$ENV" == "dev" ]]; then
  echo "Open http://localhost or http://\${APP_DOMAIN}"
fi
