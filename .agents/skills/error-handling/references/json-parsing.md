# Parsing JSON

Read when parsing JSON — user input, a stored blob, localStorage, anything that round-trips dates. The one-line rule is in `SKILL.md`; this page is which parse a path takes.

- **User-supplied JSON** (uploads, external input): Zod `safeParse` and throw `InvalidOperationError` on failure — never bare `JSON.parse` with a cast. Validated endpoint data may use `jsonDateParse` from `@esposter/shared`.

- **JSON containing dates** (localStorage, blobs, any `JSON.stringify` round trip): parse with `jsonDateParse` — its reviver restores ISO strings to `Date`s, so the Zod schema keeps plain `z.date()`.

- **Unless a schema validates the payload, in which case `JSON.parse` + `z.coerce.date()` is the correct pair.** A reviver guesses a date from a string's shape, so it cannot be pointed at content holding user-authored strings: a Sheet cell is typed `boolean | null | number | string`, and an ISO datetime typed into one would be revived into a `Date` its own schema then rejects — failing the whole resource read over one cell. A schema, by contrast, knows exactly which fields are dates. Which parse a path takes is decided in `apps/web/content/docs/architecture/serialization.md`, not per call site.
