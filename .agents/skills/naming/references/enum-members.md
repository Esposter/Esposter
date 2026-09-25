# Enum members

Read when naming an enum member whose value comes from outside the repo — a wire string, a library's own enum, a
format notation. That a member is PascalCase is `SKILL.md`'s; this page is where the outside spelling goes instead,
and the two members that keep it.

## The member is ours, the value is theirs

A member is only our code's name for the value, so it follows our casing even where its values come from another
library: `Dark = "dark"`, `Eq = "eq"`, `Direction.Down`. The outside vocabulary lives in the value, which is what
crosses the wire, and nowhere else.

**Rejected: a member copying the outside casing** — the OData operators as `eq`, the Tiled types as
`objectgroup`. It makes one enum read in two casings depending on where its values came from, and a reader can no
longer tell a member from a value at the call site. Lint refuses a lowercase, underscored or all-capitals member.

## The two that keep the outside spelling, behind a disable

- **A standard notation whose casing is its meaning** — `DateToken`'s format tokens, where `MM` is a month and `mm`
  a minute, so PascalCasing them would erase the distinction the notation exists to make.
- **A mirror TypeScript must accept as a library's own enum** — the dungeons' `Direction` copies grid-engine's
  member names, since two enums are compatible only when their member names match too.
