---
name: claude-permissions
description: Esposter Claude Code permission-rule conventions for the allow-only .agents/settings.local.json — the shipped file is the standard (every rule is the trailing space-star form, colon sub-scripts get their own rule), mirroring rules across Bash and PowerShell, and sorting. Generic harness semantics live in the update-config skill. Apply when editing settings.local.json or debugging why a command still prompts.
---

# Claude Code Permission Rules (`.agents/settings.local.json`)

Generic harness semantics — rule format, `deny`/`ask`/`allow` evaluation order, compound-command splitting, wrapper stripping — are owned by the **update-config** skill. This file records only what is specific to this repo.

The repo's `settings.local.json` is **allow-only**: it has no `deny` or `ask` list. Keep it that way unless the user asks otherwise.

## The one non-obvious rule: use `command *`, and give colon sub-scripts their own rule

**The shipped `settings.local.json` is the standard — copy its shape.** Every rule in it is the trailing `space + *` form (`Bash(pnpm lint *)`, `Bash(az resource show *)`), and that file is known to work. Match it rather than reaching for `:*` or a no-space `*`; those forms are not used anywhere in this repo and are not known to work here.

`pnpm lint *` covers `pnpm lint` and `pnpm lint --fix`, but **not** `pnpm lint:fix` — hence the file's separate `pnpm lint:fix *`, `pnpm lint:fix:packages *`, and `pnpm outdated:dependencies *` entries. Each colon sub-script you actually invoke needs its own rule. That is the first thing to check when a command still prompts.

## Project conventions for `settings.local.json`

1. **Mirror every rule under both `Bash(...)` and `PowerShell(...)`.** This repo runs on Windows (PowerShell primary) with the Bash tool also available; keep the two blocks symmetric.
2. **Sort each block case-insensitively** (Bash block, then PowerShell block, then `mcp__*`, `Skill(...)`, `WebFetch(domain:...)`).
3. Scope `az` to read-only verbs (`show`, `list`) only.
4. **Explicit rules for read-only commands are kept, not pruned.** The file deliberately ships `Bash(cat *)`, `Bash(ls *)`, `Bash(grep *)`, `Bash(git diff *)`, `Bash(xargs *)` and friends even though Bash auto-allows much of that set. They exist for **PowerShell parity** (the read-only auto-allow set is documented for Bash, not PowerShell) and so both blocks stay symmetric per rule 1. Don't delete them as "redundant"; do mirror any new one into both blocks.

PowerShell canonicalizes aliases before matching, so `PowerShell(Get-ChildItem *)` already covers `gci`, `ls`, and `dir`; matching is case-insensitive.
