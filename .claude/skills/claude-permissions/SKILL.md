---
name: claude-permissions
description: Esposter Claude Code permission-rule conventions for the allow-only .claude/settings.local.json — Bash/PowerShell wildcard semantics (only the trailing space-* form works; :* and no-space * do NOT match here, so colon sub-scripts need their own explicit rule), mirroring rules across both shells, and sorting. Generic harness semantics live in the update-config skill. Apply when editing settings.local.json or debugging why a command still prompts.
---

# Claude Code Permission Rules (`.claude/settings.local.json`)

Generic harness semantics — rule format, `deny`/`ask`/`allow` evaluation order, compound-command splitting, wrapper stripping — are owned by the **update-config** skill. This file records only what is specific to this repo.

The repo's `settings.local.json` is **allow-only**: it has no `deny` or `ask` list. Keep it that way unless the user asks otherwise.

## The one non-obvious rule: use `command *`, and give colon sub-scripts their own rule

**Only the trailing `space + *` form works in this harness.** `:*` and the no-space `*` form do **not** match — verified empirically (`pnpm format*` and `pnpm format:*` both kept prompting; `pnpm format *` is what finally allowed it).

| Pattern             | Matches                        | Does NOT match                 |
| ------------------- | ------------------------------ | ------------------------------ |
| `Bash(pnpm lint *)` | `pnpm lint`, `pnpm lint --fix` | `pnpm lint:fix`, `pnpm linter` |
| `Bash(pnpm lint:*)` | — (never matches)              | everything                     |
| `Bash(pnpm lint*)`  | — (never matches)              | everything                     |

The consequence: `pnpm lint *` does not cover `pnpm lint:fix` — the `:` breaks the word boundary, so each colon sub-script you actually invoke needs its own rule (`pnpm lint:fix *`, `pnpm outdated:dependencies *`). This is also the first thing to check when a command still prompts.

## Project conventions for `settings.local.json`

1. **Mirror every rule under both `Bash(...)` and `PowerShell(...)`.** This repo runs on Windows (PowerShell primary) with the Bash tool also available; keep the two blocks symmetric.
2. **Sort each block case-insensitively** (Bash block, then PowerShell block, then `mcp__*`, `Skill(...)`, `WebFetch(domain:...)`).
3. Scope `az` to read-only verbs (`show`, `list`) only.
4. **Explicit rules for read-only commands are kept, not pruned.** The file deliberately ships `Bash(cat *)`, `Bash(ls *)`, `Bash(grep *)`, `Bash(git diff *)`, `Bash(xargs *)` and friends even though Bash auto-allows much of that set. They exist for **PowerShell parity** (the read-only auto-allow set is documented for Bash, not PowerShell) and so both blocks stay symmetric per rule 1. Don't delete them as "redundant"; do mirror any new one into both blocks.

PowerShell canonicalizes aliases before matching, so `PowerShell(Get-ChildItem *)` already covers `gci`, `ls`, and `dir`; matching is case-insensitive.
