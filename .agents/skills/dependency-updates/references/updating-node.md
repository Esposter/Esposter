# Updating node

Read when the node version moves. This page holds the whole procedure; `SKILL.md` keeps the one line that node moves as one group and is never hand-edited.

Two things write the node version, and both write all three values at once. Renovate's `node` group bumps `engines.node`, `devEngines.runtime` and the `@types/node` catalog entry in one branch (`references/renovate.md`), which merges on green like any minor; after pulling it, run `pnpm update:node` with no argument so the machine catches up — steps 3 to 5 below, since package.json already carries the version. Ahead of the bot, `pnpm update:node [version]` from the repo root is the same write by hand. With no argument it targets npm's `latest` for `node`, the Current line rather than LTS, which is the line Renovate's `node` rule tracks too (`references/renovate.md`). In one call it:

1. Bumps both node pins in root `package.json` together — `devEngines.runtime` (what `pnpm/setup` installs on the runners) and `engines.node` (what every other tool reads). They are the same number by definition; never write one alone
2. Bumps the `@types/node` catalog entry to the highest release matching the new node major
3. Installs the new version with fnm and sets it as the default (`fnm install`/`default`) — `fnm default` persists for every new shell. It deliberately does not run `fnm use`: the script runs in a nested non-interactive shell, so a `use` would only mutate a PATH that dies with the script
4. Enables corepack on the new version (a freshly installed node ships it disabled, so `pnpm` would otherwise be missing)
5. Schedules removal of the old version — fnm can't delete a node version while it's in use, so a detached process retries `fnm uninstall <old>` until this call's node processes exit, then removes it (self-cleaning, no process killing)

The TS orchestration (`scripts/src/updateNode/`) resolves versions and edits the manifests; the per-OS `install.ps1`/`install.sh` (dispatched via `crossOS`, like `refresh:lockfile`) do the fnm work. Pure helpers (version selection, manifest editing) live under `scripts/src/services/updateNode/` with unit tests; the generic registry/version utilities live in `scripts/src/services/shared/`.

On Windows the bump also stales virrun's warm snapshot, and the re-provision runs `corepack pnpm install` in the WSL guest — a separate fnm install this script never reaches. Node stopped bundling corepack, so a guest on one of those releases fails every sandboxed command with `/bin/sh: 1: corepack: not found` until it is given one (`npm i -g corepack` against the guest's node bin). The warm snapshot is why this surfaces on a node bump rather than on the release that dropped corepack.

It deliberately does **not** refresh the lockfile. After it finishes, run `pnpm refresh:lockfile` to resolve the new `@types/node`. Already-open shells keep the old version until reopened.
