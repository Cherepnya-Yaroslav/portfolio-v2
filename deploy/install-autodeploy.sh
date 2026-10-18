#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" != 0 || $# != 1 ]]; then
  echo 'Run as root: install-autodeploy.sh <deployment-public-key-file>' >&2
  exit 2
fi
read -r key_type key_value _ < "$1"
if [[ "$key_type" != ssh-ed25519 || ! "$key_value" =~ ^[A-Za-z0-9+/=]+$ ]]; then
  echo 'Expected an Ed25519 public key' >&2
  exit 2
fi
ssh-keygen -lf "$1" >/dev/null

if ! id portfolio-deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash portfolio-deploy
fi
install -d -m 0700 -o portfolio-deploy -g portfolio-deploy /home/portfolio-deploy/.ssh
printf 'restrict,command="sudo -n /usr/local/sbin/portfolio-deploy" %s %s\n' "$key_type" "$key_value" \
  > /home/portfolio-deploy/.ssh/authorized_keys
chown portfolio-deploy:portfolio-deploy /home/portfolio-deploy/.ssh/authorized_keys
chmod 0600 /home/portfolio-deploy/.ssh/authorized_keys

sudoers_file=$(mktemp)
trap 'rm -f "$sudoers_file"' EXIT
cat > "$sudoers_file" <<'SUDOERS'
Defaults:portfolio-deploy env_keep += "SSH_ORIGINAL_COMMAND"
portfolio-deploy ALL=(root) NOPASSWD: /usr/local/sbin/portfolio-deploy ""
SUDOERS
visudo -cf "$sudoers_file"
install -m 0440 "$sudoers_file" /etc/sudoers.d/portfolio-deploy
install -m 0750 "$(dirname "$0")/deploy-vps.sh" /usr/local/sbin/portfolio-deploy.new
mv -f /usr/local/sbin/portfolio-deploy.new /usr/local/sbin/portfolio-deploy
echo 'Deployment-only SSH access configured.'
