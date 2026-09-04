#!/bin/sh
set -eu

git pull --ff-only && docker compose up -d --build --force-recreate app && docker compose logs --tail=50 app
