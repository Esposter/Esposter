# Object Literals

Read when an object literal could fit on one line, or sits inside an inline snapshot.

- **An object literal that fits the width is on one line, and `oxfmt` decides it.** `oxfmt.config.ts` sets
  `objectWrap: "collapse"`, so `pnpm format` collapses every object, destructuring pattern and JSON object that
  fits — a newline after `{` is no longer a way to keep one broken, and there is no per-site opt-out. The trade was
  taken knowingly: a deliberate one-key-per-line expansion goes with the accidental ones, and in return the rule has
  no sweep, no ledger row and no lint rule behind it.
- **Never inside an inline snapshot.** The object in a `toMatchInlineSnapshot` template is not source — it is the
  serializer's output, and Vitest compares it line for line, so collapsing one that fits turns a passing suite red.
  The formatter does not reach into a template literal, and neither does a hand edit: a snapshot body is rewritten
  only by `pnpm test <path> --run -u`. The rule stops at the snapshot's opening backtick.
