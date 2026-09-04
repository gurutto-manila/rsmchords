# Docker operations

Run these commands from the repository directory containing `docker-compose.yml`.

## Deploy the latest code on the server

The deployment helper pulls the current branch using fast-forward only, rebuilds and recreates the app container, and prints its latest 50 log lines:

```sh
sh deploy.sh
```

On Linux, you can optionally make it directly executable with `chmod +x deploy.sh` and then run `./deploy.sh`.

This is equivalent to:

```sh
git pull --ff-only
docker compose up -d --build --force-recreate app
docker compose logs --tail=50 app
```

## Rebuild after source changes

Use this after changing source code, dependencies, frontend code, or backend code:

```sh
docker compose up -d --build --force-recreate app
```

## Apply environment changes

When only `.env` changed, recreate the app without rebuilding its image:

```sh
docker compose up -d --force-recreate app
```

## Restart without configuration or code changes

```sh
docker compose restart app
```

## Force a clean rebuild

Use this if Docker appears to reuse stale build files:

```sh
docker compose build --no-cache app
docker compose up -d --force-recreate app
```

## Check status and logs

```sh
docker compose ps
docker compose logs --tail=50 app
```

PostgreSQL data and uploaded attachments are not removed by these commands. Avoid `docker compose down -v` unless you intentionally want to delete Docker-managed volumes.
