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

## Update RSMChords from upstream Gigboy

Keep the branches separated by purpose:

- `main` is the clean branch synchronized with upstream Gigboy.
- `rsm-configs` is the permanent RSM Church customization branch.
- `update/upstream-vX.Y` is an optional temporary branch for testing a large upstream update.
- `rsmchords-vX.Y` is a tag for a tested RSMChords release.

Do not recreate `rsm-configs` for each upstream release. Update `main`, then merge `main` into `rsm-configs`.

### Confirm the upstream remote

```sh
git remote -v
```

If `upstream` is missing, add it once:

```sh
git remote add upstream https://github.com/blindpassasjer/gigboy.git
```

### Synchronize the fork's main branch

Start with a clean working tree, then run:

```sh
git switch main
git fetch upstream --tags
git merge --ff-only upstream/main
git push origin main
```

The **Sync fork** action on GitHub can also update `main`, but it does not automatically update `rsm-configs`.

### Merge the update into RSMChords

For a routine update:

```sh
git switch rsm-configs
git merge main
```

If Git reports conflicts, inspect them with:

```sh
git status
```

Edit each conflicted file so it retains the new upstream functionality and the RSM Church branding. When every conflict is resolved:

```sh
git add .
git commit
```

To cancel the merge and return to the state before it started:

```sh
git merge --abort
```

Rebuild and verify the merged application:

```sh
docker compose up -d --build --force-recreate app
docker compose ps
docker compose logs --tail=100 app
```

After testing successfully:

```sh
git push origin rsm-configs
```

The production server can then deploy it with:

```sh
sh deploy.sh
```

### Use a temporary branch for a large update

For a major update such as upstream v2.3, create the temporary branch from `rsm-configs`:

```sh
git switch rsm-configs
git switch -c update/upstream-v2.3
git merge main
```

Resolve conflicts and test on this branch. Then publish it:

```sh
git push -u origin update/upstream-v2.3
```

Open a GitHub pull request using:

```text
base: rsm-configs
compare: update/upstream-v2.3
```

Merge the pull request after testing, then delete the temporary update branch.

### Tag a tested RSMChords release

Use a tag instead of keeping a permanent branch for every version:

```sh
git switch rsm-configs
git pull --ff-only
git tag -a rsmchords-v2.3 -m "RSMChords based on upstream v2.3"
git push origin rsmchords-v2.3
```

Normal merges are recommended for `rsm-configs`. Avoid rebasing or force-pushing this deployed branch.
