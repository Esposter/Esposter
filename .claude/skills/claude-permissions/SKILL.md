---
name: claude-permissions
description: Esposter Claude Code permission-rule conventions for .claude/settings.local.json — Bash/PowerShell wildcard semantics (:* equals trailing space-*, bare * for colon sub-scripts), mirroring rules across both shells, sorting, and what is already auto-allowed. Apply when editing settings.local.json allow/deny/ask lists or debugging why a command still prompts.
---

# Claude Code Permission Rules (`.claude/settings.local.json`)

Rule format is `Tool` or `Tool(specifier)`. Evaluation order is **deny → ask → allow**; first match wins, specificity does not reorder.

## Wildcard semantics (Bash + PowerShell)

| Pattern             | Meaning                                                                       | Matches                                                        | Does NOT match                 |
| ------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| `Bash(pnpm lint *)` | prefix + **word boundary** (space or end-of-string)                           | `pnpm lint`, `pnpm lint --fix`                                 | `pnpm lint:fix`, `pnpm linter` |
| `Bash(pnpm lint:*)` | **identical** to `pnpm lint *` — `:*` is just the trailing-wildcard shorthand | same as above                                                  | `pnpm lint:fix`                |
| `Bash(pnpm lint*)`  | prefix, **no boundary**                                                       | `pnpm lint`, `pnpm lint:fix`, `pnpm lint --fix`, `pnpm linter` | —                              |

Critical rules:

- **`:*` ≡ a trailing space + `*`.** They are the same matcher. Listing both `pnpm build *` and `pnpm build:*` is pure duplication.
- **`:*` is only special at the end** of a pattern. Mid-pattern (`git:* push`) the `:` is a literal char and won't match.
- **A single `*` spans spaces** — one wildcard covers multiple arguments. `git *` matches `git log --oneline --all`.
- **Colon sub-scripts need the no-space form.** `pnpm lint:fix`, `pnpm build:docker`, `pnpm outdated:dependencies` are NOT covered by `pnpm lint:*` / `pnpm lint *`. Use `pnpm lint*` (no space) to cover a script **and** all its `:sub` variants in one rule. This is why pnpm-script families in our allowlist use the no-space form, while plain commands (`git log *`, `pnpm why *`) keep the boundary form.

## Already auto-allowed — do not add Bash rules for these

These **Bash** commands run without a prompt in every mode (built-in read-only set), so allow rules for them are redundant:
`ls cat echo pwd head tail grep find wc which diff stat du cd`, plus read-only `git` forms (`diff`, `log`, `status`, `ls-tree`, `show`, …).

Process wrappers are stripped before matching, so a rule for the inner command already covers them: `timeout`, `time`, `nice`, `nohup`, `stdbuf`, and **bare** `xargs` (`Bash(grep *)` covers `xargs grep x`; `xargs -n1 grep` is NOT stripped).

> We still keep these in the allowlist for **PowerShell** parity and cross-shell safety (the read-only auto-allow set is documented for Bash, not PowerShell). PowerShell canonicalizes aliases before matching, so `PowerShell(Get-ChildItem *)` already covers `gci`, `ls`, and `dir`; matching is case-insensitive.

## Compound commands

Both shells split on operators (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines; PowerShell via AST) and require **every** subcommand to match. `Bash(safe-cmd *)` does not authorize `safe-cmd && rm -rf .`. Env-runner prefixes (`npx`, `docker exec`, `devbox run`) are NOT stripped — write a rule for the full inner command.

## Project conventions for `settings.local.json`

1. **Mirror every rule under both `Bash(...)` and `PowerShell(...)`.** This repo runs on Windows (PowerShell primary) with the Bash tool also available; keep the two blocks symmetric.
2. **Use the no-space form (`pnpm name*`) for pnpm script families** so `:sub` scripts and args are covered by one rule.
3. **Use the boundary form (a trailing space + `*`) for everything else.** Never add both `:*` and the space-`*` form for the same command.
4. **Sort each block case-insensitively** (Bash block, then PowerShell block, then `mcp__*`, `Skill(...)`, `WebFetch(domain:...)`).
5. Scope `az` to read-only verbs (`show`, `list`) only.

## Debugging "still prompts"

- Prompt on `pnpm foo:bar`? The rule is `pnpm foo:*` / `pnpm foo *` (boundary) — switch to `pnpm foo*`.
- Prompt on a compound command? One subcommand lacks a matching rule.
- Prompt on `npx <x>` / `docker exec <x>`? Wrapper not stripped — add a rule for the full command.
