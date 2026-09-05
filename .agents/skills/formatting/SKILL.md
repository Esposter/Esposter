---
name: formatting
description: Esposter code formatting — blank-line placement around consts/returns/blocks, the test-file exception, and comment attachment/content rules (comment only exceptional behaviour, describe the present never the history, never argue for the refactor that produced the code, keep error-text quotes, `/** */` only on an exported API surface). Apply when writing or editing any file's whitespace or comments.
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

## Comments

- **A `//` comment goes on its own line _above_ the code it describes, never trailing on the same line.** `const x = f(); // why` becomes a comment line then the statement. Own-line comments read consistently, survive the capitalization hook, and don't push lines past the width limit. (Directive comments that must be inline — a rare `// eslint-disable-line` — are the only exception.)
- **No blank line before _or after_ a `//` comment** — a comment attaches directly to the code it describes and acts as the separator. Blank lines go between uncommented logical blocks only. This includes **functional/directive comments** (`// oxlint-disable-next-line ...`, `// @ts-expect-error ...`, etc.) — they attach directly to the line they govern with no surrounding blank line.

  ```ts
  // CORRECT — comment acts as separator
  const foo = readFoo(input);
  // Read bar
  const bar = readBar(input);

  // WRONG — blank line + comment is redundant
  const foo = readFoo(input);

  // Read bar
  const bar = readBar(input);
  ```

  - **Consecutive `//` lines are one comment block — never blank-separate them.** A multi-line explanation is a contiguous run of `//` lines with no gaps; a blank line _between_ two comment lines splits one thought into two and is wrong. This is the same rule as "no blank line after a comment" applied to a comment that is itself the next line.

    ```ts
    // CORRECT — one contiguous block
    // Opens a local mic and exposes the live level.
    // No shared analyser exists to reuse here.
    export const useThing = () => {};

    // WRONG — blank line splits one comment block
    // Opens a local mic and exposes the live level.

    // No shared analyser exists to reuse here.
    export const useThing = () => {};
    ```

  - **This is a rule about statements inside a block.** Between two **top-level declarations** the blank line is the file's paragraph break and the comment attaches to the declaration below it — the two are doing different jobs, so both stay. Inside a function or a `<script setup>` body there is only one job to do, and the comment does it.

  - **Deleting a leading comment takes the separator with it.** A comment above a top-level declaration, or directly under the import block, is standing in for the blank line that would otherwise be there — so a pass that removes the comment has to put the blank line back. The import case fails `import/newline-after-import` at lint; the declaration case fails nothing at all and just reads as two paragraphs run together.

  - **Exception — `.test.ts`/`.test-d.ts` files**: do NOT strip these blank lines. Oxlint's `vitest` plugin enforces `vitest/padding-around-test-blocks`, which _requires_ a blank line around `describe`/`test` blocks. A leading comment on such a block sits after that mandatory blank line, so keep it. Blank lines around hooks and between expect groups are convention here rather than enforced — keep them for the same readability reason, but nothing fails if one is missing. Still tighten the comment text itself.

- **CRITICAL — comment only _exceptional_ behaviour.** A comment earns its place only when it explains something a competent reader could not infer from the code, its names, or the project's own conventions. **Never restate an established pattern or anything already documented in a skill or feature doc.** The skill/doc is the single source of truth; duplicating it in a comment is noise that rots. Concretely, delete comments that:
  - restate a convention covered by a skill (e.g. "a `.test.ts` so the barrel generator keeps it out of the public barrel", "the result helper turns the throw into false, per the error-handling convention", "memoized because…" when memoization is the obvious idiom);
  - paraphrase what a well-named function/variable already says ("// resolve the repo root" above `resolveRepoRoot()`);
  - duplicate a rationale already written in a sibling file — state it once at the source, not at every call site.

  Keep comments for genuinely non-obvious _why_: a workaround for a specific external bug/quirk, a subtle ordering/race constraint, an overlayfs/kernel/platform footgun, a security boundary. When in doubt, prefer deleting — a wrong-but-confident comment is worse than none.

- **CRITICAL — comments describe the present, never the history.** A comment states what the code does and why it does it _now_, never how it used to work or what it replaced; git is the changelog. Delete any clause that only makes sense as a before/after story — `equivalent to the old X`, `replaces the former Y`, `now that Z the old reason is moot`, `used to …`, `no longer needed since …` — and rewrite it to assert the current behaviour. **Migration state is history too**: no roadmap phases, no "until X lands", no transitional wiring in a code comment; sweep those in the change that completes the migration, since the roadmap doc is where phase history lives. Mention a rejected **alternative** only where the reader needs it to not "fix" the code back to it, in one clause.

  ```ts
  // WRONG — narrates removed behaviour
  // `foo()` (equivalent to the old `bar()`) provisions both layers.
  // Now that baz persists its output, the old discarded-buffer reason is moot; the real blocker is nesting.

  // CORRECT — states the present reason only
  // `foo()` provisions both layers.
  // Runs on the host, not the sandbox: a nested sandbox is forbidden inside the outer one.
  ```

  Two narrow exceptions survive because they still help the _current_ reader: (1) a comment quoting the **actual external error/warning text** a workaround addresses (it's how the next person greps the cause — see below); (2) a **regression guard** in a test may name the failure mode it defends against, phrased as a present hazard (`coupling both to one check flips this assertion`), not as a past state (`a regression to the old gate`).

- **A comment explains the code, never the change that produced it.** "Stated once rather than left to drift",
  "cached because it is read twice", "shared so a control added here reaches both" — these argue for a refactor
  that has already happened, to a reader who is looking at the result and cannot see the alternative. They are
  also the convention restated at the call site: reuse, work and identity are the `vue` skill's, deduplication is
  `file-organization`'s, and a rule copied beside one of its instances is the copy that goes stale. Write what the
  code does and the non-obvious constraint it is under; if the pass turned up a rule worth stating, state it in
  the owning skill, where every future reader gets it instead of this one file's reader.
- **`/** */` is for an exported API surface, `//` for everything else.** A doc block on an exported class, interface or helper is what an editor shows at the call site, which a `//` above the declaration is not; anything internal gets `//`. Its **content** obeys every rule above regardless — a doc block that restates the declaration's own name, or claims something typecheck already proves ("correctly implements the interface"), earns nothing and goes.
- **Keep comments tight and generic** — explain the _why_ in general terms; don't bake in specific example values (versions, IDs, payloads, magic numbers). Prefer a single line, but keep a bulleted list (one item per `//` line) when enumerating distinct items rather than cramming them into one sentence. If an example helps, show only the minimal fragment. Applies to `//`, `/* */`, and Vue `<!-- -->` alike.
- **Keep error/warning examples** — when a comment quotes the actual error or warning text a workaround addresses (e.g. `[Vue warn]: Invalid prop: type check failed`), keep that quote — it's how the next person greps for the cause. Trim it to the minimal identifying fragment; drop surrounding example values.
- **Don't fight `eslint(capitalized-comments)`** — oxlint enforces an uppercase first letter on every `//` line, so a wrapped sentence shows a mid-sentence capital on its continuation line. That's fine, and lowercasing one to read better is a lint error rather than a style choice. What it cannot see is the difference between a prose word and a code identifier, so a wrapped line starting with `node_modules`, `pnpm` or `oxlint` gets capitalized into a name that does not exist — and `--fix` writes it. Rewrap so a line starts with prose; a line opening on a backtick or a bracket is exempt, which is why `` `pnpm build` `` may start one.

  **Rewrapping a comment is what creates this**, so it is the edit to re-check rather than the original text. Changing a word early in a block reflows every line after it, and an identifier that sat mid-line lands at the front of one — the corruption is written by the pass that was fixing the previous one. After editing any comment, grep the added lines for a line-initial identifier before committing:

  ```bash
  git diff -U0 | grep -E '^\+\s*//\s+([A-Z][a-z]+[A-Z-][a-zA-Z]*|(Pnpm|Oxlint|Tsdown|Tinybench|Sdk|Sas))'
  ```

  Two shapes, because one pattern cannot express both. The first catches an identifier with a later capital to anchor on (`ToPrecision`, `Vue-tsc`); a one-word name (`Pnpm`, `Tinybench`) has none, so it is caught by enumeration instead — the comments ledger keeps that list, since it only grows when a new tool name turns up. Broadening the first to any capitalized token is not the fix: `capitalized-comments` capitalizes _every_ continuation line, so it would match nearly all of them.

  Most hits are prose (`Non-Vue`, `Selector-based`) or a real PascalCase name; what fails is a camelCase or lowercase one (`toPrecision`, `tinybench`, `vue-tsc`, `pnpm`).

## Line Endings

- Enforced by `.gitattributes` (`text eol=lf` for `.ts`/`.vue`/`.js`/`.json`/`.md`/`.yaml`/`.sh`; `.bat`/`.cmd`/`.ps1` are deliberately `crlf`) and settled by `oxfmt` (`pnpm format`). Never hand-convert line endings.
