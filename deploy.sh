#!/usr/bin/env bash

set -euo pipefail

# ---------------------------------------------------------------------------
# deploy.sh — Build, sync, create app compute, and deploy to Databricks Apps
# Usage:
#   APP_NAME=my-app WS_APP_PATH=/Workspace/Users/me/my-app ./deploy.sh
#   APP_NAME=my-app WS_APP_PATH=/Workspace/Users/me/my-app SKIP_BUILD=1 ./deploy.sh
#   APP_NAME=my-app WS_APP_PATH=/Workspace/Users/me/my-app PROFILE=dev ./deploy.sh
# ---------------------------------------------------------------------------

APP_NAME="${APP_NAME:-}"
WS_APP_PATH="${WS_APP_PATH:-}"
PROFILE="${PROFILE:-}"
SKIP_BUILD="${SKIP_BUILD:-0}"
APP_DESCRIPTION="${APP_DESCRIPTION:-Customer manager app}"
SOURCE_PATH="$(cd "$(dirname "$0")" && pwd)"

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
blue()  { printf "\033[34m%s\033[0m\n" "$*"; }
die()   { red "ERROR: $*"; exit 1; }

DBX_ARGS=()
if [[ -n "$PROFILE" ]]; then
  DBX_ARGS+=(--profile "$PROFILE")
fi

blue "==> Checking prerequisites..."
command -v databricks >/dev/null 2>&1 || die "Databricks CLI not found."
command -v node >/dev/null 2>&1 || die "node is required but not found."
command -v npm >/dev/null 2>&1 || die "npm is required but not found."

[[ -z "$APP_NAME" ]] && die "APP_NAME is required."
[[ -z "$WS_APP_PATH" ]] && die "WS_APP_PATH is required (example: /Workspace/Users/<you>/customer-manager)."

databricks "${DBX_ARGS[@]}" auth status >/dev/null 2>&1 || die "Databricks CLI is not authenticated. Run: databricks auth login"

green "    App name:      $APP_NAME"
green "    Workspace src: $WS_APP_PATH"
[[ -n "$PROFILE" ]] && green "    Profile:       $PROFILE"

if [[ "$SKIP_BUILD" == "1" ]]; then
  blue "==> Skipping build (SKIP_BUILD=1)"
  [[ -d "$SOURCE_PATH/build" ]] || die "build/ directory not found. Run once without SKIP_BUILD=1."
else
  blue "==> Installing dependencies..."
  npm --prefix "$SOURCE_PATH" install --silent

  blue "==> Building app..."
  npm --prefix "$SOURCE_PATH" run build
fi

blue "==> Syncing source to workspace..."
databricks "${DBX_ARGS[@]}" sync "$SOURCE_PATH" "$WS_APP_PATH" \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "*.log"

blue "==> Ensuring app exists..."
if ! databricks "${DBX_ARGS[@]}" apps get "$APP_NAME" >/dev/null 2>&1; then
  databricks "${DBX_ARGS[@]}" apps create "$APP_NAME" --description "$APP_DESCRIPTION"
fi

blue "==> Ensuring app compute is running..."
databricks "${DBX_ARGS[@]}" apps start "$APP_NAME" >/dev/null 2>&1 || true

blue "==> Deploying from workspace path..."
databricks "${DBX_ARGS[@]}" apps deploy "$APP_NAME" --source-code-path "$WS_APP_PATH"

green ""
green "✓ Deployment successful"
blue "  Status: databricks ${PROFILE:+--profile $PROFILE }apps get $APP_NAME"
blue "  Deploy: databricks ${PROFILE:+--profile $PROFILE }apps get-deployment $APP_NAME"
blue "  Logs:   databricks ${PROFILE:+--profile $PROFILE }apps logs $APP_NAME --follow"
