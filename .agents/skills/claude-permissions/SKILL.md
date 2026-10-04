---
name: claude-permissions
description: Apply when editing settings.local.json or debugging why a command still prompts. Esposter Claude Code permission-rule conventions for the allow-only .agents/settings.local.json — the shipped file is the standard (a command taking arguments is the trailing space-star form, colon sub-scripts get their own rule), mirroring rules across Bash and PowerShell, and sorting. Generic harness semantics live in the update-config skill.
---

# Claude Code Permission Rules (`.agents/settings.local.json`)

Generic harness semantics — rule format, `deny`/`ask`/`allow` evaluation order, compound-command splitting, wrapper stripping — are owned by the **update-config** skill. This file records only what is specific to this repo.

The repo's `settings.local.json` is **allow-only**: it has no `deny` or `ask` list. Keep it that way unless the user asks otherwise.

Permissions are all it holds. The sibling `.agents/settings.json` is the checked-in half — the marketplace the checkout declares for itself and the plugin it enables (`apps/web/content/docs/architecture/agent-configuration.md`) — so a plugin or harness setting meant for everyone goes there, never here.

## Settled — do not re-propose

- **Pruning the explicit read-only rules as redundant** (`Bash(cat *)`, `Bash(ls *)`, `Bash(git diff *)` and friends). The read-only auto-allow set is documented for Bash, not PowerShell, so they are what gives the PowerShell block parity — mirror a new one into both blocks instead.
- **The `:*` or no-space `*` rule forms.** Neither is used anywhere in this repo and neither is known to work here; the trailing `space + *` form the shipped file uses is.

## The one non-obvious rule: use `command *`, and give colon sub-scripts their own rule

**The shipped `settings.local.json` is the standard — copy its shape.** A command that takes arguments is the trailing `space + *` form (`Bash(pnpm lint *)`, `Bash(az resource show *)`); a command run as one fixed string is its exact text (`Bash(pnpm i)`, `Bash(pnpm graph:gen)`), and that file is known to work.

`pnpm lint *` covers `pnpm lint` and `pnpm lint --fix`, but **not** `pnpm lint:fix` — hence the file's separate `pnpm lint:fix *`, `pnpm lint:fix:packages *`, and `pnpm outdated:dependencies *` entries. Each colon sub-script you actually invoke needs its own rule. That is the first thing to check when a command still prompts.

## Project conventions for `settings.local.json`

- **Mirror every rule under both `Bash(...)` and `PowerShell(...)`.** This repo runs on Windows (PowerShell primary) with the Bash tool also available; keep the two blocks symmetric.
- **Sort each block case-insensitively** (Bash block, then PowerShell block, then `mcp__*`, `Skill(...)`, `WebFetch(domain:...)`).
- **Scope `az` to read-only verbs** (`show`, `list`).

PowerShell canonicalizes aliases before matching, so `PowerShell(Get-ChildItem *)` already covers `gci`, `ls`, and `dir`; matching is case-insensitive.
