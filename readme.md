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

## Install Databricks CLI (macOS and Windows)

### macOS

Install with Homebrew:

```bash
brew tap databricks/tap
brew install databricks
```

Verify:

```bash
databricks --version
databricks auth profiles
```

### Windows laptop

#### Option A (recommended): install from WinGet

```powershell
winget search databricks
winget install <databricks-cli-package-id>
```

#### Option B: download CLI binary and add to PATH

- Download the latest Databricks CLI release for Windows from the official Databricks CLI releases page.
- Add the CLI executable location to your Windows `Path` environment variable.
- Open a new PowerShell window.

Verify:

```powershell
databricks --version
databricks auth profiles
```

If install commands change over time, use the official Databricks CLI install docs for the latest package name and steps.

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

Windows laptop (PowerShell):

```powershell
databricks auth login --host https://<your-workspace-host>
databricks auth login --host https://<your-workspace-host> --profile <profile-name>
databricks auth profiles
databricks auth status --profile <profile-name>
```

Windows note: the same commands also work in Git Bash or WSL.

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

Windows laptop (PowerShell):

```powershell
databricks auth login --host https://<your-workspace-host>
databricks auth status

databricks auth login --host https://<your-workspace-host> --profile <profile-name>
databricks auth status --profile <profile-name>
```

## 2) Build the app locally (recommended)

From this repository root:

```bash
npm install
npm run build
```

Windows laptop (PowerShell):

```powershell
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

Windows laptop (PowerShell):

```powershell
# Example values
$env:WS_APP_PATH = "/Workspace/Users/<your-user-email>/customer-manager"
$env:PROFILE = "<profile-name>"

# One-time/incremental sync
databricks sync . $env:WS_APP_PATH --exclude ".git" --exclude "node_modules" --exclude "*.log"
databricks sync . $env:WS_APP_PATH --profile $env:PROFILE --exclude ".git" --exclude "node_modules" --exclude "*.log"

# Continuous sync
databricks sync . $env:WS_APP_PATH --watch --exclude ".git" --exclude "node_modules"
databricks sync . $env:WS_APP_PATH --profile $env:PROFILE --watch --exclude ".git" --exclude "node_modules"
```

If using Git Bash/WSL on Windows, use the macOS/Linux command block for this step.

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

Windows laptop (PowerShell):

```powershell
$env:APP_NAME = "customer-manager-app"
$env:PROFILE = "<profile-name>"

databricks apps create $env:APP_NAME --description "Customer manager app"
databricks apps create $env:APP_NAME --profile $env:PROFILE --description "Customer manager app"
databricks apps get $env:APP_NAME
databricks apps get $env:APP_NAME --profile $env:PROFILE
databricks apps list
databricks apps list --profile $env:PROFILE

# If app was created with --no-compute
databricks apps start $env:APP_NAME
databricks apps start $env:APP_NAME --profile $env:PROFILE
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

Windows laptop (PowerShell):

```powershell
databricks apps deploy $env:APP_NAME --source-code-path $env:WS_APP_PATH
databricks apps deploy $env:APP_NAME --profile $env:PROFILE --source-code-path $env:WS_APP_PATH
databricks apps get-deployment $env:APP_NAME
databricks apps get-deployment $env:APP_NAME --profile $env:PROFILE
databricks apps logs $env:APP_NAME --follow
databricks apps logs $env:APP_NAME --profile $env:PROFILE --follow
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

## 6) Deploy using `deploy.sh` (recommended one-command flow)

`deploy.sh` runs this sequence for you:
- install/build locally (unless skipped)
- sync source to workspace
- create app if missing
- start app compute
- deploy app from workspace source path

### macOS / Linux

```bash
export APP_NAME="customer-manager-app"
export WS_APP_PATH="/Workspace/Users/<your-user-email>/customer-manager"
export PROFILE="<profile-name>"

./deploy.sh
```

Optional skip build:

```bash
SKIP_BUILD=1 ./deploy.sh
```

### Windows laptop

Best option: run from **Git Bash** (or WSL), since `deploy.sh` is a bash script.

#### Option A: Git Bash / WSL

```bash
export APP_NAME="customer-manager-app"
export WS_APP_PATH="/Workspace/Users/<your-user-email>/customer-manager"
export PROFILE="<profile-name>"

bash ./deploy.sh
```

#### Option B: PowerShell (invoke bash explicitly)

```powershell
$env:APP_NAME = "customer-manager-app"
$env:WS_APP_PATH = "/Workspace/Users/<your-user-email>/customer-manager"
$env:PROFILE = "<profile-name>"

bash .\deploy.sh
```

Windows notes:
- Install Git for Windows to get `bash` (Git Bash).
- Keep workspace paths in Databricks format (for example `/Workspace/Users/...`), not Windows file paths.
- If `bash` is not found in PowerShell, open Git Bash and run the Git Bash command block above.
