---
name: git
description: Esposter git workflow conventions — commit message format, safety rules, and branch hygiene. Apply when running git operations or advising on source control workflows.
---

# Git Conventions

## Commit Message Format

Conventional-commits format and the type list are in `~/.claude/rules/git-workflow.md`.

**Commit attribution is enabled.** `~/.claude/settings.json` sets no `includeCoAuthoredBy` key, so it defaults on — recent commits carry the `Co-Authored-By` trailer. Expect it; don't strip it. (The global rules file claims attribution is disabled — it is not.)

## Multi-line Commit Messages — Tool-Specific Syntax

The **Bash** tool is POSIX sh, NOT PowerShell. Never use PowerShell here-string syntax (`@'...'@`) in the Bash tool — it is taken literally and leaves stray `@` lines in the commit message. Pick the form matching the tool:

- **Bash tool** → heredoc piped to `-F -`:

  ```bash
  git commit -F - <<'EOF'
  fix: short subject

  Body line.
  EOF
  ```

- **PowerShell tool** → single-quoted here-string with `@'` / `'@` at column 0:

  ```powershell
  git commit -m @'
  fix: short subject

  Body line.
  '@
  ```

After committing, verify with `git log -1 --format='%B'` before pushing.

## Safety Rules

- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit.
- **Never push into a running CodeRabbit review** — if the branch has an open PR, check the review state first; pushing mid-review cancels it, burns a rate-limit slot, and loses the in-progress findings for good (CodeRabbit won't re-review commits it has already seen):

  ```bash
  gh pr checks --json name,state,description --jq '.[] | select(.name=="CodeRabbit")'
  ```

  Push only on `SUCCESS`; otherwise wait for it to settle. Full rationale and symptoms in the **coderabbit** skill.

## Pushing

Batch commits and push **once** per coherent chunk of work. Several pushes in quick succession each retrigger review, so the later ones reliably land mid-review — the exact case the rule above exists to prevent.

## Branch Hygiene

- Always create feature branches from `develop`, not `main`
- PRs target `develop`; `develop` merges to `main` for releases
- Delete branches after merging
