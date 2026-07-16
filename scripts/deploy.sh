#!/usr/bin/env bash
# Deploy manual a GitHub Pages (GitHub Actions está bloqueado en la cuenta).
# Publica dist/ en la rama gh-pages (Pages source = branch gh-pages).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run verify

REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

cp -r dist/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -qm "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f "$REMOTE" gh-pages
echo "✅ Desplegado en https://mamueljr.github.io/AuraInventory/"
