---
name: git
description: Esposter git workflow conventions — commit message format, safety rules, and branch hygiene. Apply when running git operations or advising on source control workflows.
---

# Git Conventions

## Commit Message Format

```text
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## Safety Rules

- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes with no easy recovery. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit instead.

## Branch Hygiene

- Always create feature branches from `develop`, not `main`
- PRs target `develop`; `develop` merges to `main` for releases
- Delete branches after merging
