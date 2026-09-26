---
name: string-utils
description: Apply when trimming, normalizing or sanitizing a string, pluralizing a count, or matching a token inside authored content. Esposter string normalization and HTML sanitization conventions — pluralize over a hand-rolled count ternary; normalizeString as the default trim in app code and base Zod schemas (never in Vue — the vue skill owns that); sanitizeTextHtml declared at the Zod boundary in base db-schema schemas; the exceptions (user-facing transformation actions, standalone packages, localStorage drafts); and token matching in authored content — opener-anchored matching over negated charsets, walking string leaves instead of the serialized form, one pass keyed by a Map, and widening the reader instead of backfilling.
---

# String Normalization

## `normalizeString`

Trims whitespace and returns empty string for absent/null/undefined inputs. Lives in `@esposter/shared`.

```ts
import { normalizeString } from "@esposter/shared";

normalizeString("  hello  "); // → "hello"
normalizeString(null); // → ""
normalizeString(undefined); // → ""
```

## `pluralize`

`${count} ${pluralize("result", count)}` — the hand-rolled `""`/`"s"` ternary is a `no-restricted-syntax` error, and a non-plural `s` disables it with that reason (`references/pluralize.md`).

## Convention: `string` not `string | null`

Optional text is `string` with `""` as its absence — the `typescript` skill (`references/absent-values.md`), and for the column side the `drizzle` skill (`references/sentinel-columns.md`).

## When to use `normalizeString`

The default trim in app code — reach for it over a bare `.trim()`:

- Parsing (CSV, XLSX, clipboard): `normalizeString(cell?.toString())`
- Array mapping: `values.map(normalizeString).filter(Boolean)`
- Guard checks: `if (!normalizeString(value)) return;`
- Filter predicates: `.filter((line) => normalizeString(line) !== "")`
- Zod schemas: see "Zod Schema Alignment" below

## When NOT to use `normalizeString`

- **Never in Vue** — lint-enforced by `restrictedTrimSyntaxes.js`; the `vue` skill owns the why.
- **User-facing transformation actions** — e.g. `computeStringTransformation.ts` `Trim` case; keep `value.trim()`, it's implementing a named user operation.
- **The `normalizeString` function itself** — obviously.
- **Trimming a process's or a file's output inside a package** — stdout, a token file, a hook's stdin, xml2js's own `trim` option. `.trim()` is correct there: none of it is user input crossing a Zod boundary, and a package that has no other use for `@esposter/shared` should not take it on for a trim.

`.trimStart()` and `.trimEnd()` are separate methods — replace only when semantically equivalent to a full `.trim()`.

## Preserve `undefined` when needed

In a non-form composable where `normalizeString` is allowed (e.g. `useAutoSearch`), when the old value in a `watch` callback must stay `undefined` to signal "first render" (distinct from an empty string that was previously seen):

```ts
const sanitizedOld = oldValue !== undefined ? normalizeString(oldValue) : oldValue;
```

## Zod Schema Alignment

Base select schemas normalize so server validation matches client input. Always transform first, then validators in the pipe. Never add trim transforms to derived schemas (`UpdateFooInput`, etc.) — only in the base select schema.

Prefer the shared schema helpers over hand-rolling the transform+pipe — see the `zod` skill.

```ts
// db-schema createSelectSchema overrides — the canonical form
foo: (schema) => createNormalizedStringSchema(FOO_MAX_LENGTH, schema),
```

## Matching a Token Inside Authored Content

A token in authored content is matched on the delimiter that opened it, over the parsed value's string leaves, in one pass keyed by a `Map`, and a changed form widens the reader rather than backfilling (`references/content-tokens.md`, `apps/web/content/docs/architecture/content-token-rewriting.md`).

## HTML Sanitization at the Zod Boundary

Rich-text HTML is sanitized once, by `.transform(sanitizeTextHtml)` in the base Zod schema — never a frontend call, except a localStorage draft (`references/html-sanitization.md`).

## Reference pages

- `references/pluralize.md` — when a string carries a count, or the plural ternary is refused.
- `references/content-tokens.md` — before writing or widening a regex over authored content.
- `references/html-sanitization.md` — when a field holds rich-text HTML, or a sanitize call is about to be written.
