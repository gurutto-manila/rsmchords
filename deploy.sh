#!/bin/sh
set -eu

git pull --ff-only &&
docker compose -f docker-compose.cwp.yml up -d --build --force-recreate &&
docker compose -f docker-compose.cwp.yml logs --tail=50 app