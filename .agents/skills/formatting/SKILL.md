---
name: formatting
description: Apply when writing or editing any file's whitespace or comments. Esposter code formatting — blank-line placement around consts, returns and blocks with the test-file exception, and the comment rules: a comment on its own line above its code with no blank line around it, only exceptional behaviour, the present never the history, `/** */` only on an exported API surface, and the capitalized-comments rewrap re-read.
---

# Formatting

Cross-cutting whitespace and comment rules for all files. Language/framework-specific structure lives in `vue`, `typescript`, `file-organization`; how to write a skill doc lives in `skill-authoring`. This skill owns only spacing and comments.

## Blank Lines

- **No blank lines between consecutive `const` assignments** — group them tightly.
- **No blank line before a `return`** that immediately follows a `const` in a small function (including composables that return a function directly — `return` follows the last setup line with no gap).
- **Blank line after a closing `}`** of an `if`/`for`/block statement — unless it is the last statement in its scope or immediately followed by another opening block. (Exception: consecutive top-level `watch`/lifecycle-hook registrations in a Vue `<script setup>` each get a blank line between them — see the `vue` skill.)
- **Blank line between an SFC's top-level blocks** — enforced and autofixed by `vue/padding-line-between-blocks`, so it survives a comment deleted from a block boundary without anyone having to remember it.
- **No blank lines within Vue templates.** A blank line inserted to visually separate template sections is a smell that the component owns more than one responsibility — extract each section into its own focused child component rather than spacing them apart. See the `vue-page-composition` skill (maximal granularity / one concern per component).
- **Imports** — order and blank lines are autofixed by `perfectionist/sort-imports` (`packages/configuration/eslint/plugins/perfectionist.js`); `pnpm lint:fix` settles it. `internalPattern: []` is what collapses every source (`external-pkg`, `#shared`, `@vueuse/*`, `@/`) into one bucket per kind, so the fixer produces a contiguous `import type` group, one blank line, then a contiguous value group. Don't hand-place import blank lines.

## Object Literals

An object literal that fits the width is on one line — `oxfmt`'s `objectWrap: "collapse"` decides it, and an inline snapshot is the one place it does not reach (`references/object-literals.md`).

## Comments

- **A `//` comment goes on its own line _above_ the code it describes, never trailing on the same line** (`comments/no-trailing-comment`). Own-line comments read consistently, survive the capitalization hook, and don't push lines past the width limit. The rule passes the two shapes that share a line by design: a same-line disable directive, and the comment the formatter itself hangs after a ternary's `?` or `:`.
- **No blank line before or after a `//` comment** — it attaches to its code and is the separator, at module scope too; consecutive `//` lines are one block, and deleting a leading comment puts its blank line back. Test files keep theirs (`references/comment-placement.md`).
- **CRITICAL — comment only _exceptional_ behaviour** — never restate a convention a skill or doc already holds (`references/comment-content.md`).
- **CRITICAL — comments describe the present, never the history**; git is the changelog (`references/comment-content.md`).
- **A comment explains the code, never the change that produced it** (`references/comment-content.md`).
- **`/** */` is for an exported API surface and a module-scope paragraph, `//` for everything else** (`references/doc-blocks.md`).
- **Tight and generic** — no baked-in example values; an actual error text a workaround addresses is kept (`references/comment-content.md`).
- **Don't fight `eslint(capitalized-comments)`** — after a rewrap, move an identifier off the line front and re-read the joined sentence (`comments/no-capitalized-identifier`, `references/capitalized-comments.md`).

## Line Endings

- Enforced by `.gitattributes` (`* text=auto eol=lf` — every text file checks out LF whatever "core.autocrlf" says on the machine; `.bat`/`.cmd`/`.ps1` are deliberately `crlf`) and settled by `oxfmt` (`pnpm format`). Never hand-convert line endings.

## Deep Dives

- `references/comment-placement.md` — when placing a comment against its code, a blank line, another comment, or in a test file.
- `references/comment-content.md` — when writing or reviewing what a comment says.
- `references/doc-blocks.md` — when choosing between `/** */` and `//`.
- `references/object-literals.md` — when an object literal could fit one line, or sits in an inline snapshot.
- `references/capitalized-comments.md` — when `capitalized-comments` fires, or after rewrapping a comment block.
