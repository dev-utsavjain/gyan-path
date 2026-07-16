#!/usr/bin/env bash
#
# redeploy.sh — build the frontend, embed it into this Go backend, and deploy to Railway.
#
# Pipeline:
#   1. Build the frontend (vite) in the sibling repo  -> produces  <frontend>/dist
#   2. Copy that dist into  internal/dist  so Go's //go:embed all:dist (internal/fs.go) picks it up
#   3. railway up  -> Railway builds the Dockerfile (go build embeds dist) and runs ./start.sh
#                     (start.sh runs migrations, then starts the server)
#
# Auth: uses a Railway PROJECT TOKEN so the CLI never needs an interactive browser login.
#   1. Railway dashboard -> Project -> Settings -> Tokens -> create a Project Token
#   2. Save it next to this script:   echo 'RAILWAY_TOKEN=xxxx' > .railway.env   (already git-ignored)
#
# Usage:
#   ./redeploy.sh --setup      # ONE-TIME: create the backend service + push .env variables to it
#   ./redeploy.sh              # full pipeline: build frontend -> copy -> railway up
#   ./redeploy.sh --build      # only build the frontend and copy dist into internal/dist (no deploy)
#   ./redeploy.sh --deploy     # only railway up (assumes internal/dist already populated)
#   ./redeploy.sh --db         # redeploy/restart the Postgres service (frees "too many clients" slots)
#   ./redeploy.sh --status     # show Railway services / status

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
FRONTEND_DIR="${FRONTEND_DIR:-../future-Skill}"   # sibling frontend repo
APP_SERVICE="${APP_SERVICE:-future-skill-backend}" # Railway backend service name
DB_SERVICE="${DB_SERVICE:-Postgres}"               # Railway Postgres service name
# Public URL used to verify a deploy actually went live. Falls back to .env's
# FRONTEND_URL, then to the production domain.
VERIFY_URL="${VERIFY_URL:-}"
# ──────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIST="$SCRIPT_DIR/internal/dist"

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
err() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; }

# ── Build frontend + copy dist into the backend ────────────────────────────────
build_frontend() {
  local fe
  fe="$(cd "$SCRIPT_DIR/$FRONTEND_DIR" 2>/dev/null && pwd || true)"
  if [ -z "$fe" ] || [ ! -f "$fe/package.json" ]; then
    err "Frontend not found at '$FRONTEND_DIR' (resolved from $SCRIPT_DIR)."
    err "Set FRONTEND_DIR to the correct path."
    exit 1
  fi

  log "Building frontend in $fe"
  ( cd "$fe" && { [ -d node_modules ] || npm install; } && npm run build )

  if [ ! -d "$fe/dist" ]; then
    err "Build finished but $fe/dist does not exist. Check the frontend build output dir."
    exit 1
  fi

  log "Copying $fe/dist -> $DEST_DIST"
  rm -rf "$DEST_DIST"
  cp -r "$fe/dist" "$DEST_DIST"
  log "Embedded dist ready ($(find "$DEST_DIST" -type f | wc -l | tr -d ' ') files)."
}

# ── Railway auth + CLI bootstrap ────────────────────────────────────────────────
ensure_railway() {
  # Optional: load a project token from .railway.env if present.
  if [ -z "${RAILWAY_TOKEN:-}" ] && [ -f "$SCRIPT_DIR/.railway.env" ]; then
    set -a; . "$SCRIPT_DIR/.railway.env"; set +a
  fi
  [ -n "${RAILWAY_TOKEN:-}" ] && export RAILWAY_TOKEN

  if ! command -v railway >/dev/null 2>&1; then
    log "Installing Railway CLI via npm..."
    npm install -g @railway/cli
  fi

  # Auth check: either a token is set, or an interactive `railway login` session exists.
  if [ -z "${RAILWAY_TOKEN:-}" ] && ! railway whoami >/dev/null 2>&1; then
    err "Not authenticated. Either run 'railway login', or put a project token in"
    err "$SCRIPT_DIR/.railway.env  (RAILWAY_TOKEN=xxxx)"
    exit 1
  fi
  log "Using $(railway --version)"
}

# True if a service named $APP_SERVICE already exists in the linked project.
service_exists() {
  railway status --json 2>/dev/null | grep -q "\"name\"[[:space:]]*:[[:space:]]*\"$APP_SERVICE\""
}

# Create the backend service and push all .env values to it (one-time setup).
setup_app() {
  ensure_railway
  if service_exists; then
    log "Service '$APP_SERVICE' already exists — skipping creation."
  else
    log "Creating service '$APP_SERVICE' in the linked project..."
    railway add --service "$APP_SERVICE"
  fi

  if [ ! -f "$SCRIPT_DIR/.env" ]; then
    err "No .env found — cannot push variables."; exit 1
  fi
  log "Pushing variables from .env to '$APP_SERVICE' (skipping PORT — Railway injects it)..."
  # Parse .env line-by-line (do NOT source it — values may be unquoted and contain spaces).
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|\#*) continue;; esac          # skip blanks and comments
    [ "${line%%=*}" = "$line" ] && continue           # skip lines without '='
    key="$(printf '%s' "${line%%=*}" | tr -d '[:space:]')"
    [ -z "$key" ] && continue
    [ "$key" = "PORT" ] && continue
    val="${line#*=}"                                   # everything after the first '='
    case "$val" in                                     # strip one layer of matching quotes
      \"*\") val="${val#\"}"; val="${val%\"}" ;;
      \'*\') val="${val#\'}"; val="${val%\'}" ;;
    esac
    railway variable set "$key=$val" --service "$APP_SERVICE" --skip-deploys >/dev/null \
      && echo "  set $key"
  done < "$SCRIPT_DIR/.env"
  log "Variables pushed. Now run: ./redeploy.sh   (build + deploy)"
}

deploy_app() {
  ensure_railway
  if ! service_exists; then
    err "Service '$APP_SERVICE' not found in the linked project."
    err "Run './redeploy.sh --setup' first to create it and push .env variables."
    exit 1
  fi
  log "Deploying backend (service: $APP_SERVICE) — Railway builds the Dockerfile and runs ./start.sh"
  # The CLI's log stream can drop on a flaky network and exit non-zero even when
  # the deploy succeeds server-side. Don't treat that as fatal — verify the live
  # site instead (see verify_deploy), which is the real source of truth.
  if ! ( cd "$SCRIPT_DIR" && railway up --service "$APP_SERVICE" --ci ); then
    err "railway CLI exited non-zero (often just a dropped log stream, not a failed deploy)."
    err "Verifying the live site to find out what really happened…"
  fi
  verify_deploy
}

# verify_deploy polls the live URL until it serves the bundle we just built and
# the API is healthy. This is what tells you the deploy worked — not the CLI.
verify_deploy() {
  if ! command -v curl >/dev/null 2>&1; then
    log "curl not found — skipping live verification."
    return 0
  fi

  local url="$VERIFY_URL"
  if [ -z "$url" ]; then
    url="$(grep -E '^FRONTEND_URL=' "$SCRIPT_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' )"
  fi
  [ -z "$url" ] && url="https://gyaanpathdigital.in"
  url="${url%/}"

  local bundle
  bundle="$(ls "$DEST_DIST"/assets/index-*.js 2>/dev/null | head -1 | xargs -n1 basename 2>/dev/null || true)"
  if [ -z "$bundle" ]; then
    err "Could not find the built bundle in $DEST_DIST/assets — cannot verify."
    return 1
  fi

  log "Verifying $url is serving the new build ($bundle)…"
  local i live health
  for i in $(seq 1 24); do   # ~4 min max (24 × 10s)
    live="$(curl -fsS --max-time 10 "$url/" 2>/dev/null | grep -oE 'assets/index-[A-Za-z0-9_]+\.js' | head -1 || true)"
    health="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url/api/health" 2>/dev/null || echo 000)"
    if [ "$live" = "assets/$bundle" ] && [ "$health" = "200" ]; then
      log "✅ DEPLOY VERIFIED — $url is serving $bundle and /api/health is 200."
      return 0
    fi
    printf '   …attempt %s/24: live=%s health=%s (waiting for new container)\n' "$i" "${live:-none}" "$health"
    sleep 10
  done

  err "❌ Could not confirm the new build went live after ~4 min."
  err "   Expected bundle: assets/$bundle"
  err "   Last seen live:  ${live:-none} (health $health)"
  err "   Check the build logs in the Railway dashboard for a build/runtime error."
  return 1
}

redeploy_db() {
  ensure_railway
  log "Redeploying Postgres service: $DB_SERVICE (clears stuck connections)"
  railway redeploy --service "$DB_SERVICE" --yes
}

show_status() {
  ensure_railway
  railway status || true
}

case "${1:-all}" in
  --setup)  setup_app ;;
  --build)  build_frontend ;;
  --deploy) deploy_app ;;
  --db)     redeploy_db ;;
  --status) show_status ;;
  all|"")
    build_frontend
    deploy_app
    ;;
  *)
    err "Unknown option: $1"
    err "Usage: ./redeploy.sh [--setup | --build | --deploy | --db | --status]"
    exit 1
    ;;
esac

log "Done."
