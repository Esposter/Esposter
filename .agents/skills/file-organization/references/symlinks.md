# Symlinks

Read when creating or verifying a tracked symlink.

Always PowerShell `New-Item -ItemType SymbolicLink -Path <link> -Target <target>` (needs Developer Mode or an elevated shell), deleting the existing file first.

**Never `ln -s` on Windows** — Git Bash's `ln` copies the file instead of linking, so duplicate content gets committed silently. The repo sets `core.symlinks=true` and stores links as git mode `120000`; verify with `git ls-files -s <path>`.

Tracked symlinks: `AGENTS.md` is the canonical agent guide, with `CLAUDE.md` and `GEMINI.md` pointing at it; `.claude` → `.agents`, so a harness reading either name finds one tree; each package's `eslint.config.js` → the shared `../configuration/eslint/index.{typescript,vue}.js`.
