---
name: formatting
description: Esposter code formatting — blank-line placement, comment attachment and style, import grouping, and LF line endings. Apply when writing or editing any file's whitespace, comments, import order, or line endings.
---

# Formatting

Cross-cutting whitespace, comment, and line-ending rules for all files. Language- and framework-specific structure lives in those skills (`vue`, `typescript`, `file-organization`); this skill owns only how code is spaced and commented.

## Blank Lines

- **No blank lines between consecutive `const` assignments** — group them tightly.
- **No blank line before a `return`** that immediately follows a `const` in a small function (including composables that return a function directly — `return` follows the last setup line with no gap).
- **Blank line after a closing `}`** of an `if`/`for`/block statement — unless it is the last statement in its scope or immediately followed by another opening block.
- **No blank lines within Vue templates.**
- **Imports** — a single blank line separates the `import type` group from the value `import` group. Never insert blank lines between value imports (or within the type group); all value imports stay contiguous regardless of source (`#shared`, `@vueuse/*`, `@/`).

## Comments

- **No blank line before _or after_ a `//` comment** — a comment attaches directly to the code it describes and acts as the separator. Blank lines go between uncommented logical blocks only.

  ```ts
  // CORRECT — comment acts as separator
  const foo = parseWorkspace(yaml);
  // Parse lockfile
  const bar = parseLockfile(yaml);

  // WRONG — blank line + comment is redundant
  const foo = parseWorkspace(yaml);

  // Parse lockfile
  const bar = parseLockfile(yaml);
  ```

  - **Exception — `.test.ts`/`.test-d.ts` files**: do NOT strip these blank lines. `vitest.configs.all` (enabled in the eslint vitest plugin config) turns on the `vitest/padding-around-*` rules, which _require_ a blank line around `describe`/`test` blocks, hooks (`beforeEach`/`afterEach`), and expect groups. A leading comment on such a block sits after that mandatory blank line, so keep it. Still tighten the comment text itself.

- **Avoid unnecessary comments** — prefer descriptive names. Keep comments that explain _why_ (non-obvious decisions, disable reasons, workarounds).
- **Keep comments tight and generic** — explain the _why_ in general terms; don't bake in specific example values (versions, IDs, payloads, magic numbers). Prefer a single line, but keep a bulleted list (one item per `//` line) when enumerating distinct items rather than cramming them into one sentence. If an example helps, show only the minimal fragment. Applies to `//`, `/* */`, and Vue `<!-- -->` alike.
- **Keep error/warning examples** — when a comment quotes the actual error or warning text a workaround addresses (e.g. `[Vue warn]: Invalid prop: type check failed`), keep that quote — it's how the next person greps for the cause. Trim it to the minimal identifying fragment; drop surrounding example values.
- **Don't fight the comment-capitalization hook** — a hook capitalizes the first letter of every `//` line, so a wrapped sentence shows a mid-sentence capital on its continuation line. That's fine. Only avoid starting a wrapped line with a case-sensitive code identifier the hook would corrupt — reword those.

## Declaration Layout

- **Interfaces/types at the top** — within a `.vue` `<script setup>` or `.ts` module, group all local `interface`/`type` declarations together at the top of the block (after imports), before the runtime `const`/logic. Don't interleave a stray interface between logic blocks.

## Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- The `Write` tool on Windows always produces CRLF. **Immediately after every `Write` call**, convert:
  ```bash
  sed -i 's/\r//' "path/to/file"
  ```
  For multiple files: `find "path/to/dir" -name "*.md" | xargs -I{} sed -i 's/\r//' "{}"`.
