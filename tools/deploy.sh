#!/bin/sh
# Deploys Chakri to https://chakri.9io.ai: runs the tests, then copies the page, its modules and the
# images to /var/www/chakri on the 9io web server. The Nginx site is sites/_deploy/chakri.9io.ai.conf
# in the stocks-bot repo. Extra ssh options can go in SSH_OPTS.
#
# The server and key aren't kept in the repository. Set CHAKRI_HOST (user@server) and CHAKRI_KEY
# (path to the ssh key) in the environment, or in tools/deploy.env, which git ignores.
set -e
cd "$(dirname "$0")/.."
[ -f tools/deploy.env ] && . tools/deploy.env
HOST=${CHAKRI_HOST:?"set CHAKRI_HOST=user@server, or put it in tools/deploy.env"}
KEY=${CHAKRI_KEY:?"set CHAKRI_KEY=/path/to/key, or put it in tools/deploy.env"}

npm test >/dev/null || { echo "tests failed; not deploying" >&2; exit 1; }

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
cp -R index.html style.css icon.svg apple-touch-icon.png og.jpg src "$STAGE/"
# For search engines and AI assistants; the .txt named after the key is IndexNow's proof of ownership.
cp robots.txt sitemap.xml llms.txt f628e47d659bd013d7feaca2cb8426d2.txt "$STAGE/"
# mktemp makes the folder private, and rsync -a would carry that over to /var/www/chakri.
chmod -R u=rwX,go=rX "$STAGE"
# braces matter: zsh would read "$HOST:/var" as a history modifier
rsync -az --delete -e "ssh -i $KEY $SSH_OPTS" "$STAGE/" "${HOST}:/var/www/chakri/"

code=$(curl -s -o /dev/null -w '%{http_code}' https://chakri.9io.ai/)
[ "$code" = 200 ] || { echo "live check failed ($code): https://chakri.9io.ai/" >&2; exit 1; }
echo "live  https://chakri.9io.ai/"
