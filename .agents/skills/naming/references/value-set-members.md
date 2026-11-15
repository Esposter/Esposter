# Value set members

Read when naming a value set's member whose value comes from outside the repo — a wire string, a library's own enum,
a format notation. That a member is PascalCase is `SKILL.md`'s; this page is where the outside spelling goes instead,
and the members that keep it.

## The member is ours, the value is theirs

A member is only our code's name for the value, so it follows our casing even where its values come from another
library: `Dark: "dark"`, `Eq: "eq"`. The outside vocabulary lives in the value, which is what crosses the wire, and
nowhere else.

**A member copying the outside casing is rejected** (`SKILL.md`, Settled) — the OData operators as `eq`, the Tiled
types as `objectgroup`. It makes one set read in two casings depending on where its values came from, and a reader can
no longer tell a member from a value at the call site. Lint refuses a lowercase, underscored or all-capitals key on an
exported PascalCase `as const` object whose values are literals.

## The exceptions that keep the outside spelling, behind a disable

- **A standard notation whose casing is its meaning** — `DateToken`'s format tokens, where `MM` is a month and `mm`
  a minute, so PascalCasing them would erase the distinction the notation exists to make.
- **A mirror of a library's own set** — the dungeons' `Direction` copies grid-engine's `Direction`, which shared code
  cannot import at runtime, under grid-engine's own keys, so a member reads the same whichever of the two a file
  imports.
