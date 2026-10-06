---
name: absent-values
description: Apply when a value can be empty or missing — an optional field, prop, column or procedure input, a `?:`, `undefined`, `null`, `.optional()`, `.nullable()`, `.default(...)`, `|| undefined`, `?? null`, or a filter dropping empties before a call. Esposter's one absent form per value — `""` for an app-owned string and `0` for a count with no domain meaning, carried unchanged from ref to input to row to read, `undefined` only where absence differs from every real value, and `null` only inside an external boundary's own shape.
---

# Absent Values

## Settled — do not re-propose

- **Turning a `""` sentinel back into `undefined`** — at the write (`value || undefined`, an input transform), at rest (`.optional()` beside `.or(z.literal(""))`) or at the read (`.filter((value) => value !== undefined)`). `undefined` was removed from app-owned strings so `""` is the one absent string end to end; a field still declaring `?: string` whose omission means nothing `""` does not is a leftover of that removal, finished by making it `string` with `""`, never by stripping the `""` — one whose omission means something else, such as leave unchanged beside `""` for clear, stays `?: string` (`references/string-sentinel.md`).
- **A lint gate on `null`** — every legitimate boundary site becomes a false positive, and carving them out costs more than the rule catches (`apps/web/content/docs/architecture/null-vs-undefined.md`).

## Rules

- **An app-owned string is `string` with `""` as its absence**, never `string | undefined` (`references/string-sentinel.md`).
- **The sentinel is checked by truthiness**, never compared with `=== ""` — that one shape is the reason it was chosen — save where falsy values diverge: a `number | ""` union, or `""` handled apart from an omitted value (`references/string-sentinel.md`).
- **A sentinel travels unchanged** from ref to input to row to read: the input declares it required with the sentinel in its value space, and a read hands it on to another procedure only after dropping it (`references/sentinel-propagation.md`).
- **An optional column carries the sentinel itself** — `.notNull().default("")`, or `.default(0)` where `0` means nothing (`references/sentinel-columns.md`).
- **`undefined` only where absence differs from every real value**, an absent property is `field?: T`, and `null` stays only inside an external boundary's own shape (`references/null-vs-undefined.md`).
- **"Not loaded yet" is `useQuery`'s `isPending`**, never a third absent value (`references/null-vs-undefined.md`).
- Enums never take a `None` member for absence — the `typescript` skill (`references/enums.md`).

## Reference pages

- `references/string-sentinel.md` — when typing, resetting or checking a string that may be empty.
- `references/sentinel-propagation.md` — when a sentinel crosses into an API input, a row, or another procedure's input.
- `references/sentinel-columns.md` — when adding an optional column or inserting a possibly-absent value.
- `references/null-vs-undefined.md` — when choosing between `undefined` and `null`, declaring an absent property, or consuming a boundary type that carries `null`.
