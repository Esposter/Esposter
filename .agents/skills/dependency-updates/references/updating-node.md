# Updating node

Read when the node version moves. This page holds the whole procedure; `SKILL.md` keeps the one line that node moves as one group and is never hand-edited.

The node version is one pin, `.node-version`, and two things write it, and both also move the `@types/node` catalog entry. The bot's `node` group bumps the pair in one branch (`references/renovate.md`) — a minor or patch merges on green, a major opens a PR for a person; after pulling either, run `pnpm update:node` with no argument so the machine catches up — step 3 below, since `.node-version` already carries the version. Ahead of the bot, `pnpm update:node [version]` from the repo root is the same write by hand. With no argument it targets the highest release in nodejs.org's `dist/index.json` — never the npm `node` package, whose `latest` tag is a third party's and lags the real line — the Current line rather than LTS, which is the line Renovate's `node` rule tracks too (`references/renovate.md`). In one call it:

1. Writes the version to `.node-version` — what `pnpm/setup` installs on the runners and `vp env` resolves locally
2. Bumps the `@types/node` catalog entry to the highest release matching the new node major
3. Runs `vp env install`, then `vp env clean` — the global `vp` installs the node `.node-version` names and the pnpm `packageManager` names, through shims that stand in for Corepack, and `clean` removes the versions no pin or default names any more. `vp` resolves both per directory, so nothing is defaulted or switched. `vp env` exists only in the global CLI (`https://viteplus.dev/guide/`), never the `vite-plus` copy the install lays down, so a machine without it fails here by name

The TS orchestration (`scripts/src/updateNode/`) resolves versions, edits the manifests and hands the install to `vp env`. Pure helpers (version selection, manifest editing) live under `scripts/src/services/updateNode/` with unit tests; the generic registry/version utilities live in `scripts/src/services/shared/`.

On Windows the bump also stales virrun's warm snapshot, and the re-provision runs `corepack pnpm install` in the WSL guest — a separate fnm install this script never reaches. Node stopped bundling corepack, so a guest on a release without it fails every sandboxed command with `/bin/sh: 1: corepack: not found` until it is given one (`npm i -g corepack` against the guest's node bin). The warm snapshot is why this surfaces on a node bump rather than on the release that dropped corepack.

It deliberately does **not** refresh the lockfile. After it finishes, run `pnpm refresh:lockfile` to resolve the new `@types/node`. Already-open shells keep the old version until reopened.
