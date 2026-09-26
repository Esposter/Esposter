# Object Literals

Read when an object literal could fit on one line, or sits inside an inline snapshot.

- **An object literal that fits the width is written on one line.** `oxfmt` preserves whatever expansion the
  source already has — a newline between `{` and the first key keeps the object broken however short it is — so a
  nested `where: { userId: { eq: userId } }` typed out over seven lines survives `pnpm format` untouched and
  drifts from the inline form every sibling uses. Nothing reports it, so it is collapsed by hand when it fits.
  `oxfmt`'s own `objectWrap: "collapse"` would decide it instead, at the cost of every deliberate expansion in
  the repository — that trade is open in `apps/web/content/docs/proposals/refactors/object-wrap-collapse.md`.
- **Never inside an inline snapshot.** The object in a `toMatchInlineSnapshot` template is not source — it is the
  serializer's output, and Vitest compares it line for line, so collapsing one that fits turns a passing suite red.
  A snapshot body is rewritten only by `pnpm test <path> --run -u`, never by hand. The rule stops at the
  snapshot's opening backtick.
