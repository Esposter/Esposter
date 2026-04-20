---
name: git
description: Esposter git workflow conventions — commit message format, safety rules, and branch hygiene. Apply when running git operations or advising on source control workflows.
---

# Git Conventions

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## Safety Rules

- **Never use `git stash`** — if stash pop fails or is forgotten, in-progress changes are lost with no easy recovery path. To inspect prior committed state without losing working tree changes, use `git show HEAD:path/to/file` or `git diff HEAD` instead. If you need to set aside work temporarily, commit a WIP commit instead.

## Branch Hygiene

- Always create feature branches from `develop`, not `main`
- PRs target `develop`; `develop` merges to `main` for releases
- Delete branches after merging
