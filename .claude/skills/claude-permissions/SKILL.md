---
name: claude-permissions
description: Esposter Claude Code permission-rule conventions for .claude/settings.local.json — Bash/PowerShell wildcard semantics (only the trailing space-* form works; :* and no-space * do NOT match here, so colon sub-scripts need their own explicit rule), mirroring rules across both shells, sorting, and what is already auto-allowed. Apply when editing settings.local.json allow/deny/ask lists or debugging why a command still prompts.
---

# Claude Code Permission Rules (`.claude/settings.local.json`)

Rule format is `Tool` or `Tool(specifier)`. Evaluation order is **deny → ask → allow**; first match wins, specificity does not reorder.

## Wildcard semantics (Bash + PowerShell)

**Only the trailing `space + *` form works in this harness.** The `:*` shorthand and the no-space `*` form do **not** match here — verified empirically (`pnpm format*` and `pnpm format:*` both kept prompting; `pnpm format *` is what finally allowed it).

| Pattern             | Meaning                                             | Matches                        | Does NOT match                     |
| ------------------- | --------------------------------------------------- | ------------------------------ | ---------------------------------- |
| `Bash(pnpm lint *)` | prefix + **word boundary** (space or end-of-string) | `pnpm lint`, `pnpm lint --fix` | `pnpm lint:fix`, `pnpm linter`     |
| `Bash(pnpm lint:*)` | **does NOT work** — never matches in this harness   | —                              | everything (including `pnpm lint`) |
| `Bash(pnpm lint*)`  | **does NOT work** — never matches in this harness   | —                              | everything (including `pnpm lint`) |

Critical rules:

- **Use only `command *` (a literal trailing space + `*`).** It matches the bare command and any arguments, with a word boundary (space or end-of-string). Never use `:*` or no-space `*` — neither matches.
- **A single `*` spans spaces** — one wildcard covers multiple arguments. `git *` matches `git log --oneline --all`.
- **Colon sub-scripts need their own explicit rule.** `pnpm lint *` does NOT cover `pnpm lint:fix` (the `:` breaks the word boundary). To allow a `:sub` script, add a dedicated `pnpm lint:fix *` rule. The colon is a literal char in the script name, followed by the trailing space-`*`. Add one rule per sub-script you actually invoke (e.g. `pnpm lint:fix *`, `pnpm outdated:dependencies *`).

## Already auto-allowed — do not add Bash rules for these

These **Bash** commands run without a prompt in every mode (built-in read-only set), so allow rules for them are redundant:
`ls cat echo pwd head tail grep find wc which diff stat du cd`, plus read-only `git` forms (`diff`, `log`, `status`, `ls-tree`, `show`, …).

Process wrappers are stripped before matching, so a rule for the inner command already covers them: `timeout`, `time`, `nice`, `nohup`, `stdbuf`, and **bare** `xargs` (`Bash(grep *)` covers `xargs grep x`; `xargs -n1 grep` is NOT stripped).

> We still keep these in the allowlist for **PowerShell** parity and cross-shell safety (the read-only auto-allow set is documented for Bash, not PowerShell). PowerShell canonicalizes aliases before matching, so `PowerShell(Get-ChildItem *)` already covers `gci`, `ls`, and `dir`; matching is case-insensitive.

## Compound commands

Both shells split on operators (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines; PowerShell via AST) and require **every** subcommand to match. `Bash(safe-cmd *)` does not authorize `safe-cmd && rm -rf .`. Env-runner prefixes (`npx`, `docker exec`, `devbox run`) are NOT stripped — write a rule for the full inner command.

## Project conventions for `settings.local.json`

1. **Mirror every rule under both `Bash(...)` and `PowerShell(...)`.** This repo runs on Windows (PowerShell primary) with the Bash tool also available; keep the two blocks symmetric.
2. **Always use the trailing space-`*` form (`command *`).** It is the only form that matches here — `:*` and no-space `*` never match.
3. **Add a separate `name:sub *` rule for each colon sub-script you invoke.** `pnpm lint *` does not cover `pnpm lint:fix` — that needs its own `pnpm lint:fix *` rule. Only add the sub-scripts you actually run (e.g. `pnpm lint:fix *`, `pnpm outdated:dependencies *`), not every variant.
4. **Sort each block case-insensitively** (Bash block, then PowerShell block, then `mcp__*`, `Skill(...)`, `WebFetch(domain:...)`).
5. Scope `az` to read-only verbs (`show`, `list`) only.

## Debugging "still prompts"

- Prompt on `pnpm foo:bar`? `pnpm foo *` does not cover the `:bar` sub-script (and `pnpm foo:*` never matches) — add an explicit `pnpm foo:bar *` rule.
- Prompt on a compound command? One subcommand lacks a matching rule.
- Prompt on `npx <x>` / `docker exec <x>`? Wrapper not stripped — add a rule for the full command.
