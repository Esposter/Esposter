---
name: formatting
description: Esposter code formatting — blank-line placement, comment attachment and style, import grouping, and LF line endings. Apply when writing or editing any file's whitespace, comments, import order, or line endings.
---

# Formatting

Cross-cutting whitespace, comment, and line-ending rules for all files. Language/framework-specific structure lives in `vue`, `typescript`, `file-organization`; this skill owns only spacing and comments.

## Blank Lines

- **No blank lines between consecutive `const` assignments** — group them tightly.
- **No blank line before a `return`** that immediately follows a `const` in a small function (including composables that return a function directly — `return` follows the last setup line with no gap).
- **Blank line after a closing `}`** of an `if`/`for`/block statement — unless it is the last statement in its scope or immediately followed by another opening block. (Exception: consecutive top-level `watch`/lifecycle-hook registrations in a Vue `<script setup>` each get a blank line between them — see the `vue` skill.)
- **No blank lines within Vue templates.** A blank line inserted to visually separate template sections is a smell that the component owns more than one responsibility — extract each section into its own focused child component rather than spacing them apart. See the `vue-component-patterns` skill (maximal granularity / one concern per component).
- **Imports** — a single blank line separates the `import type` group from the value `import` group. That is the _only_ blank line allowed among imports. Never insert a blank line **between two `import type` lines** (the whole type group stays contiguous, even when mixing external and `@/` alias sources) nor between value imports; all imports of the same kind stay contiguous regardless of source (`@tiptap/core`, `#shared`, `@vueuse/*`, `@/`).

  ```ts
  // CORRECT — type group contiguous, single blank before value group
  import type { Foo } from "external-pkg";
  import type { Bar } from "@/models/Bar";

  import { baz } from "#shared/services/baz";

  // WRONG — blank line splitting the type group
  import type { Foo } from "external-pkg";

  import type { Bar } from "@/models/Bar";
  ```

## Comments

- **No blank line before _or after_ a `//` comment** — a comment attaches directly to the code it describes and acts as the separator. Blank lines go between uncommented logical blocks only. This includes **functional/directive comments** (`// oxlint-disable-next-line ...`, `// @ts-expect-error ...`, etc.) — they attach directly to the line they govern with no surrounding blank line.

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

  - **Exception — `.test.ts`/`.test-d.ts` files**: do NOT strip these blank lines. `vitest.configs.all` (enabled in the eslint vitest plugin config) turns on the `vitest/padding-around-*` rules, which _require_ a blank line around `describe`/`test` blocks, hooks (`beforeEach`/`afterEach`), and expect groups. A leading comment on such a block sits after that mandatory blank line, so keep it. Still tighten the comment text itself.

- **CRITICAL — comment only _exceptional_ behaviour.** A comment earns its place only when it explains something a competent reader could not infer from the code, its names, or the project's own conventions. **Never restate an established pattern or anything already documented in a skill or feature doc.** The skill/doc is the single source of truth; duplicating it in a comment is noise that rots. Concretely, delete comments that:
  - restate a convention covered by a skill (e.g. "a `.test.ts` so ctix keeps it out of the public barrel", "getResult turns the throw into false, per the no-try/catch convention", "memoized because…" when memoization is the obvious idiom);
  - paraphrase what a well-named function/variable already says ("// resolve the repo root" above `resolveRepoRoot()`);
  - duplicate a rationale already written in a sibling file — state it once at the source, not at every call site.

  Keep comments for genuinely non-obvious _why_: a workaround for a specific external bug/quirk, a subtle ordering/race constraint, an overlayfs/kernel/platform footgun, a security boundary. When in doubt, prefer deleting — a wrong-but-confident comment is worse than none.

- **Avoid unnecessary comments** — prefer descriptive names. Keep comments that explain _why_ (non-obvious decisions, disable reasons, workarounds).
- **Keep comments tight and generic** — explain the _why_ in general terms; don't bake in specific example values (versions, IDs, payloads, magic numbers). Prefer a single line, but keep a bulleted list (one item per `//` line) when enumerating distinct items rather than cramming them into one sentence. If an example helps, show only the minimal fragment. Applies to `//`, `/* */`, and Vue `<!-- -->` alike.
- **Keep error/warning examples** — when a comment quotes the actual error or warning text a workaround addresses (e.g. `[Vue warn]: Invalid prop: type check failed`), keep that quote — it's how the next person greps for the cause. Trim it to the minimal identifying fragment; drop surrounding example values.
- **Don't fight the comment-capitalization hook** — a hook capitalizes the first letter of every `//` line, so a wrapped sentence shows a mid-sentence capital on its continuation line. That's fine. Only avoid starting a wrapped line with a case-sensitive code identifier the hook would corrupt — reword those.

## Skill Doc Examples

- **Code examples in skill docs must use generic placeholders** — `Foo`/`Bar`/`baz`, `external-pkg`, `@/models/Bar`, etc. NEVER paste the concrete identifiers, package names, or file paths from the change that prompted the note (e.g. `Editor`, `@tiptap/core`, `useDraftItems`). A skill is a reusable convention, not a changelog; task-specific names make the rule read as a one-off. Generic source categories (`#shared`, `@vueuse/*`, `@/`) are fine since they describe a class of import, not a specific symbol.

## Declaration Layout

- **Interfaces/types at the top** — within a `.vue` `<script setup>` or `.ts` module, group all local `interface`/`type` declarations together at the top of the block (after imports), before the runtime `const`/logic. Don't interleave a stray interface between logic blocks.

## Line Endings

- All files must use **LF** line endings (`\n`), not CRLF.
- The `Write` tool on Windows always produces CRLF. **Immediately after every `Write` call**, convert:
  ```bash
  sed -i 's/\r//' "path/to/file"
  ```
  For multiple files: `find "path/to/dir" -name "*.md" | xargs -I{} sed -i 's/\r//' "{}"`.
