# Databricks CLI Guide: Sync, App Compute, and Deploy

This guide shows how to:
1. Sync this app from local to your Databricks workspace.
2. Create a Databricks App (with app compute).
3. Deploy the app to that compute.

The project entrypoint is defined in `app.yaml`:
- `command: ["node", "server.js"]`

## Prerequisites

- Databricks CLI installed and on `PATH`
- A Databricks workspace URL
- Permissions to create and deploy Databricks Apps
- Node.js and npm installed (if you build locally)

## 0) Create Databricks auth profiles (recommended first step)

Create a default profile:

```bash
databricks auth login --host https://<your-workspace-host>
```

Create a named profile (for multiple workspaces/environments):

```bash
databricks auth login --host https://<your-workspace-host> --profile <profile-name>
```

List available profiles:

```bash
databricks auth profiles
```

Validate a specific profile:

```bash
databricks auth status --profile <profile-name>
```

Notes:
- Profiles are stored in `~/.databrickscfg`.
- For commands in this guide, append `--profile <profile-name>` when using a named profile.

## 1) Authenticate Databricks CLI

```bash
# Login interactively (default profile)
databricks auth login --host https://<your-workspace-host>

# Verify auth
databricks auth status
```

If you use multiple profiles:

```bash
databricks auth login --host https://<your-workspace-host> --profile <profile-name>
```

Then append `--profile <profile-name>` to all commands below.

## 2) Build the app locally (recommended)

From this repository root:

```bash
npm install
npm run build
```

This creates/updates the `build/` assets served by `server.js`.

## 3) Sync local source to Databricks workspace

Choose a workspace destination path, then sync:

```bash
# Example values
export WS_APP_PATH="/Workspace/Users/<your-user>/customer-manager"

# One-time/incremental sync
databricks sync . "$WS_APP_PATH" \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "*.log"
```

For continuous sync while developing:

```bash
databricks sync . "$WS_APP_PATH" --watch \
  --exclude ".git" --exclude "node_modules"
```

## 4) Create the Databricks App and app compute

Set your app name (must be lowercase alphanumeric + hyphens):

```bash
export APP_NAME="customer-manager-app"
```

Create the app:

```bash
databricks apps create "$APP_NAME" --description "Customer manager app"
```

By default, this creates the app and starts its compute.

Useful status checks:

```bash
databricks apps get "$APP_NAME"
databricks apps list
```

If you created it earlier with `--no-compute`, start compute with:

```bash
databricks apps start "$APP_NAME"
```

## 5) Deploy the app to app compute

Deploy from the synced workspace path:

```bash
databricks apps deploy "$APP_NAME" --source-code-path "$WS_APP_PATH"
```

Check deployment and logs:

```bash
databricks apps get-deployment "$APP_NAME"
databricks apps logs "$APP_NAME" --follow
```

## Optional: Use the included deploy script

This repository includes `deploy.sh` for local build + deploy flow:

```bash
APP_NAME="$APP_NAME" ./deploy.sh
```

Notes:
- `deploy.sh` will build (unless `SKIP_BUILD=1`) and run `databricks apps deploy`.
- If your CLI requires workspace-backed source paths in your environment, use the sync + deploy flow above.

## Common troubleshooting

- `Databricks CLI is not authenticated`:
  - Run `databricks auth login` and confirm with `databricks auth status`.
- App name validation errors:
  - Use lowercase letters, numbers, and hyphens only.
- Deployment not progressing:
  - Check app/deployment state with `databricks apps get` and `databricks apps get-deployment`.
  - Stream logs with `databricks apps logs <app-name> --follow`.
