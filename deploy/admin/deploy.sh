#!/usr/bin/env bash
# Deploy one image tag (a git commit SHA). Run as the `deploy` user in /srv/msrf/admin.
#
#   ./deploy.sh <sha>            CI calls this after pushing the image
#   ./deploy.sh <older sha>      manual rollback (see .deploy-history; the image must still be on the server)
#
# If the new version does not become healthy, the previous version is started again.
set -euo pipefail
cd "$(dirname "$0")"

TAG=${1:?usage: deploy.sh <image tag>}
[[ $TAG =~ ^[0-9a-f]{7,40}$ ]] || { echo "Invalid image tag: $TAG" >&2; exit 2; }

IMAGE=ghcr.io/zuarakcore/msrf-admin
PREVIOUS=$(tail -n 1 .deploy-history 2>/dev/null | awk '{print $2}' || true)
export IMAGE_TAG=$TAG

echo "==> Deploying $IMAGE:$TAG (previous: ${PREVIOUS:-none})"
docker image inspect "$IMAGE:$TAG" >/dev/null 2>&1 || docker pull -q "$IMAGE:$TAG"

echo "==> Starting containers"
if ! docker compose up -d --wait --wait-timeout 60 --remove-orphans; then
  echo "!! New version is unhealthy. Recent logs:" >&2
  docker compose logs --tail 60 web >&2 || true
  if [[ -n $PREVIOUS && $PREVIOUS != "$TAG" ]]; then
    echo "!! Rolling back to $PREVIOUS" >&2
    IMAGE_TAG=$PREVIOUS docker compose up -d --wait --wait-timeout 60 --remove-orphans || true
  fi
  exit 1
fi

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $TAG" >>.deploy-history

echo "==> Cleaning up old images (keeping the 5 newest)"
docker image ls "$IMAGE" --format '{{.Repository}}:{{.Tag}}' | tail -n +6 | xargs -r docker image rm >/dev/null 2>&1 || true

docker compose ps --format 'table {{.Service}}\t{{.Status}}'
echo "==> Deployed $TAG"
