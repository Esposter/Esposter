# Symlinks

Read when creating or verifying a tracked symlink.

Always PowerShell `New-Item -ItemType SymbolicLink -Path <link> -Target <target>` (needs Developer Mode or an elevated shell), deleting the existing file first.

**Never `ln -s` on Windows** — Git Bash's `ln` copies the file instead of linking, so duplicate content gets committed silently. The repo sets `core.symlinks=true` and stores links as git mode `120000`; verify with `git ls-files -s <path>`.

Tracked symlinks: `AGENTS.md` is the canonical agent guide, with `CLAUDE.md` and `GEMINI.md` pointing at it; `.claude` → `.agents`, so a harness reading either name finds one tree.

**Never symlink out of a `packages/*` directory.** pnpm's directory fetcher packs a workspace package whenever it is injected — which `pnpm deploy` always does — and rejects any entry resolving outside the package root (`ERR_PNPM_DIRECTORY_FETCHER_PATH_ESCAPE`), regardless of `files`, of `--legacy`, or of the node linker. It walks the whole directory, so a `files: ["dist"]` that would exclude the link from a tarball does not save it. Share across packages by importing the owning package instead: each `eslint.config.js` is a one-line `export { default } from "@esposter/configuration/eslint/index.{typescript,vue}.js";`.
