# Case Tables

Read when a suite runs the same test over a table of cases. The one-line rule is in `SKILL.md`; this page is its full statement.

- **`test.each` for a table of cases, never a loop around `test`** (`vitest/prefer-each`) — a loop registers every case under one name, so `pnpm test -t` cannot select one. The title takes `%s` rather than a template literal, which is what makes the row title match the case; a table of **enum members** needs `as const`, or the array widens to the enum and any discriminated union the case feeds rejects it. The one table that is a `for...of` inside a single test is a date-format matrix over every `DateFormat` — the formats are the subject, not the cases.
