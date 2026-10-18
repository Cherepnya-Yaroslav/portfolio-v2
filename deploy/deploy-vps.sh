#!/usr/bin/env bash
set -Eeuo pipefail
umask 022

readonly APP_DIR=/opt/yaroslav-portfolio
readonly STATE_DIR=/var/lib/yaroslav-portfolio-deploy
readonly ENV_FILE=/etc/yaroslav-portfolio.env
readonly REPOSITORY=https://github.com/Cherepnya-Yaroslav/portfolio-v2.git
readonly ROLLBACK_IMAGE=yaroslav-portfolio-app:rollback

read -r action revision extra <<< "${SSH_ORIGINAL_COMMAND:-}"
if [[ "$action" != deploy || ! "$revision" =~ ^[0-9a-f]{40}$ || -n "$extra" ]]; then
  echo 'Expected: deploy <40-character commit SHA>' >&2
  exit 2
fi

mkdir -p "$STATE_DIR"/{releases,backups}
exec 9>/run/lock/yaroslav-portfolio-deploy.lock
flock -w 900 9

if [[ ! -d "$STATE_DIR/repository.git" ]]; then
  git init --bare "$STATE_DIR/repository.git"
  git --git-dir="$STATE_DIR/repository.git" remote add origin "$REPOSITORY"
fi
timeout 180 git --git-dir="$STATE_DIR/repository.git" fetch --depth=1 origin +refs/heads/main:refs/heads/main
latest=$(git --git-dir="$STATE_DIR/repository.git" rev-parse refs/heads/main)
if [[ "$latest" != "$revision" ]]; then
  echo 'A newer main commit exists; its workflow will deploy it.'
  exit 0
fi

release_dir=$(mktemp -d "$STATE_DIR/releases/${revision:0:12}.XXXXXX")
git --git-dir="$STATE_DIR/repository.git" archive "$revision" | tar -x -C "$release_dir"
readonly image="yaroslav-portfolio-app:git-$revision"
readonly candidate="portfolio-check-${revision:0:12}"
backup_dir=''
promoted=false

compose() {
  APP_IMAGE="$image" docker compose --project-name yaroslav-portfolio \
    --project-directory "$APP_DIR" --env-file "$ENV_FILE" "$@"
}

sync_sources() {
  rsync -a --inplace --delete --exclude='.git' --exclude='.env*' \
    --exclude='node_modules' --exclude='.next' "$1/" "$APP_DIR/"
}

prune_low_disk() {
  local available_kb
  available_kb=$(df -Pk "$STATE_DIR" | awk 'NR == 2 { print $4 }')
  if (( available_kb < 2097152 )); then
    docker buildx prune --all --force >/dev/null \
      || echo 'Build cache cleanup will retry next deployment.' >&2
  fi
}

cleanup() {
  local result=$?
  trap - EXIT
  docker rm -f "$candidate" >/dev/null 2>&1 || true
  if (( result != 0 )) && [[ "$promoted" == true ]]; then
    echo 'Deployment failed; restoring the previous application.' >&2
    sync_sources "$backup_dir"
    APP_IMAGE="$ROLLBACK_IMAGE" docker compose --project-name yaroslav-portfolio \
      --project-directory "$APP_DIR" --env-file "$ENV_FILE" up -d --wait --wait-timeout 180
    APP_IMAGE="$ROLLBACK_IMAGE" docker compose --project-name yaroslav-portfolio \
      --project-directory "$APP_DIR" --env-file "$ENV_FILE" exec -T caddy caddy reload --config /etc/caddy/Caddyfile
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' HUP INT TERM

prune_low_disk
APP_IMAGE="$image" docker compose --project-name yaroslav-portfolio \
  --project-directory "$release_dir" --env-file "$ENV_FILE" config --quiet
APP_IMAGE="$image" docker compose --project-name yaroslav-portfolio \
  --project-directory "$release_dir" --env-file "$ENV_FILE" build app

docker run -d --name "$candidate" --network yaroslav-portfolio_backend \
  --env-file "$ENV_FILE" \
  --volume yaroslav-portfolio_app_cache:/app/.next/cache "$image" >/dev/null
docker exec -i "$candidate" node --input-type=module < "$release_dir/deploy/healthcheck.mjs"
docker rm -f "$candidate" >/dev/null

previous_container=$(compose ps -q app)
previous_image=$(docker inspect --format '{{.Image}}' "$previous_container")
docker tag "$previous_image" "$ROLLBACK_IMAGE"
backup_dir=$(mktemp -d "$STATE_DIR/backups/$(date -u +%Y%m%dT%H%M%SZ).XXXXXX")
rsync -a --exclude='.git' --exclude='.env*' --exclude='node_modules' --exclude='.next' "$APP_DIR/" "$backup_dir/"

promoted=true
sync_sources "$release_dir"
compose up -d --wait --wait-timeout 180
compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
compose exec -T app node --input-type=module < "$release_dir/deploy/healthcheck.mjs"
docker tag "$image" yaroslav-portfolio-app:latest
printf '%s\n' "$revision" > "$STATE_DIR/current-revision"
install -m 0750 "$release_dir/deploy/deploy-vps.sh" /usr/local/sbin/portfolio-deploy.new
mv -f /usr/local/sbin/portfolio-deploy.new /usr/local/sbin/portfolio-deploy
promoted=false

# Keep two source backups and releases; certificates and app cache live in Docker volumes.
touch "$release_dir" "$backup_dir"
for directory in releases backups; do
  find "$STATE_DIR/$directory" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -rn | tail -n +3 | cut -d ' ' -f 2- | xargs -r rm -rf --
done
while read -r tag identifier; do
  if [[ "$tag" == yaroslav-portfolio-app:git-* && "$tag" != "$image" && "$identifier" != "$previous_image" ]]; then
    docker image rm "$tag" >/dev/null || true
  fi
done < <(docker image ls --no-trunc --format '{{.Repository}}:{{.Tag}} {{.ID}}')
prune_low_disk
echo "Deployed $revision"
