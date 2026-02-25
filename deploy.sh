#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# deploy.sh — Build and deploy Customer Manager to Databricks Apps
# Usage:
#   APP_NAME=my-app ./deploy.sh
#   APP_NAME=my-app SKIP_BUILD=1 ./deploy.sh   # skip React build step
# ---------------------------------------------------------------------------

APP_NAME="${APP_NAME:-}"
SKIP_BUILD="${SKIP_BUILD:-0}"
SOURCE_PATH="$(cd "$(dirname "$0")" && pwd)"

# --- Helpers ----------------------------------------------------------------

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
blue()  { printf "\033[34m%s\033[0m\n" "$*"; }
die()   { red "ERROR: $*"; exit 1; }

# --- Preflight checks -------------------------------------------------------

blue "==> Checking prerequisites..."

command -v databricks >/dev/null 2>&1 || die "Databricks CLI not found. Install it: https://docs.databricks.com/dev-tools/cli/install.html"
command -v node       >/dev/null 2>&1 || die "node is required but not found."
command -v npm        >/dev/null 2>&1 || die "npm is required but not found."

[[ -z "$APP_NAME" ]] && die "APP_NAME is not set. Run: APP_NAME=<your-app-name> ./deploy.sh"

databricks auth status >/dev/null 2>&1 || die "Databricks CLI is not authenticated. Run: databricks auth login"

green "    Databricks CLI: OK"
green "    App name:       $APP_NAME"
green "    Source path:    $SOURCE_PATH"

# --- Build ------------------------------------------------------------------

if [[ "$SKIP_BUILD" == "1" ]]; then
  blue "==> Skipping build (SKIP_BUILD=1)"
  [[ -d "$SOURCE_PATH/build" ]] || die "build/ directory not found. Run without SKIP_BUILD=1 first."
else
  blue "==> Installing dependencies..."
  npm --prefix "$SOURCE_PATH" install --silent

  blue "==> Building React app..."
  npm --prefix "$SOURCE_PATH" run build
  green "    Build complete."
fi

# --- Deploy -----------------------------------------------------------------

blue "==> Deploying '$APP_NAME' to Databricks Apps..."

# Create the app if it does not already exist
if ! databricks apps get "$APP_NAME" >/dev/null 2>&1; then
  blue "    App not found — creating '$APP_NAME'..."
  databricks apps create "$APP_NAME"
fi

databricks apps deploy "$APP_NAME" --source-code-path "$SOURCE_PATH"

# --- Done -------------------------------------------------------------------

green ""
green "✓ Deployment successful!"
blue  "  To check status:  databricks apps get $APP_NAME"
blue  "  To stream logs:   databricks apps logs $APP_NAME --follow"
