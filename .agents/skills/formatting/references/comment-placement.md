# Comment Placement

Read when placing a comment — where it sits against its code, around a blank line, in a block of several lines, or in a test file. The one-line rule is in `SKILL.md`; this page is its full statement and the test-file exception.

- **No blank line before _or after_ a `//` comment** — a comment attaches directly to the code it describes and acts as the separator. Blank lines go between uncommented logical blocks only. This includes **functional/directive comments** (`// oxlint-disable-next-line ...`, `// @ts-expect-error ...`, etc.) — they attach directly to the line they govern with no surrounding blank line. **Module scope is not an exception, and neither is a class body or an object literal**: `const X = …;` / blank line / `// …` / `export const Y = …` is this violation, not a paragraph break between two declarations — the comment is the break, so the blank line goes. An SFC's `interface Props` is one of those declarations: the comment that describes the component sits directly under the interface, attached to the first macro it introduces, with no blank line between. The only blank line a comment sits under is the import block's, a file-level `/* … */` directive's, or the one the `vue` skill puts before a lifecycle hook or watcher.

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

  - **Deleting a leading comment takes the separator with it.** A comment above a top-level declaration is standing in for the blank line that would otherwise be there — so a pass that removes the comment has to put the blank line back. Nothing fails if it is missed; the code just reads as two paragraphs run together. The import block is the exception: a comment under it still takes the blank line first, which `import/newline-after-import` enforces.

  - **Exception — `.test.ts`/`.test-d.ts` files**: do NOT strip these blank lines. Oxlint's `vitest` plugin enforces `vitest/padding-around-test-blocks`, which _requires_ a blank line around `describe`/`test` blocks. A leading comment on such a block sits after that mandatory blank line, so keep it. Blank lines around hooks and between expect groups are convention here rather than enforced — keep them for the same readability reason, but nothing fails if one is missing. Still tighten the comment text itself.
