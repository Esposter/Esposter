---
name: string-utils
description: Esposter string normalization and HTML sanitization conventions — pluralize over a hand-rolled count ternary; normalizeString is the default trim in app code and in base Zod schemas (never in Vue — the vue skill owns that); sanitizeTextHtml is declared at the Zod boundary in base db-schema schemas (never manual frontend calls). Exceptions — user-facing transformation actions, standalone packages, and localStorage drafts. Also covers matching or rewriting a token inside authored content (urls, merge fields, blueprint aliases) — opener-anchored matching over negated charsets, walking string leaves instead of the serialized form, one pass keyed by a Map, and widening the reader instead of backfilling.
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

`${count} ${pluralize("result", count)}` — never a hand-rolled `${count === 1 ? "" : "s"}` in a template. It lives in `#shared/util/text/pluralize` and selects through `EN_US_PLURAL_RULES` (`Intl.PluralRules`), so the ternary is not even equivalent: the rules object is what decides, and it is the seam a non-English locale changes. The inline ternary also gets written per surface and drifts — the same count is "1 result" here and "1 results" there.

```ts
pluralize("result"); // → "results" (count defaults to 2)
pluralize("result", count);
```

## Convention: `string` not `string | null`

Optional text fields use empty string as the "absent" sentinel — never `null`:

- DB column: `text().notNull().default("")`
- TypeScript type: `string` (not `string | null`)
- Zod schema: `createNormalizedStringSchema(N, schema)` in the base `selectXxxSchema` (never in derived schemas)

## When to use `normalizeString`

The default trim in app code — reach for it over a bare `.trim()`:

- Parsing (CSV, XLSX, clipboard): `normalizeString(cell?.toString())`
- Array mapping: `values.map(normalizeString).filter(Boolean)`
- Guard checks: `if (!normalizeString(value)) return;`
- Filter predicates: `.filter((line) => normalizeString(line) !== "")`
- Zod schemas: see Zod Schema Alignment below

## When NOT to use `normalizeString`

- **Never anywhere in Vue** — not in `@update:model-value`, not in submit handlers. The tRPC Zod boundary already normalizes; in `@update:model-value` it actively harms (trims mid-typing, swallows spaces). See the `vue` skill (`normalizeString` Never in Vue) — it owns this rule.
- **User-facing transformation actions** — e.g. `computeStringTransformation.ts` `Trim` case; keep `value.trim()`, it's implementing a named user operation.
- **The `normalizeString` function itself** — obviously.
- **Standalone published packages** (`virrun`, `xml2js`) — `.trim()` is live there and correct: it trims process stdout or implements xml2js's own `trim` option, none of which is user input crossing a Zod boundary.

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

Before writing or widening any regex that finds something inside content a user authored (a blob url, a `{{variable}}`, a blueprint alias), read [/docs/architecture/content-token-rewriting](/docs/architecture/content-token-rewriting) — it is canonical. The four rules that are broken:

- **Never define the match as a negated charset** (`[^"'()<>\s\\]*`) — "everything except the delimiters I thought of" is a guess at a set that is never closed. Either the token carries its own delimiters (`{{…}}`), or anchor the match on the delimiter that opened it via lookbehind, so each context permits the characters the others reserve. An opener the content escapes (an html-escaped quote) is still an opener; a position with no recognised opener falls back to the conservative body, and that fallback is reached from **any** position — never an enumerated set of characters a token may follow, which silently matches nothing after every character the list forgets.
- **Walk the parsed value's string leaves, never regex its serialized form** — use `deepReplaceStrings` (`#shared/util/object/deepReplaceStrings`) rather than matching over `JSON.stringify(content)`, which makes the matcher read the serializer's escaping on top of the content's own.
- **One pass keyed by a `Map`, never a per-token regex loop** over the whole document — a loop lets a token consume a longer token it is a prefix of, and scales cost with tokens × content size.
- **Widen the reader, don't backfill**, when a token's canonical form changes: content is rewritten on every read, so it converges on its own.

## HTML Sanitization at the Zod Boundary

Same principle as `normalizeString`: user-authored rich-text HTML (messages, post/comment descriptions, todo notes) is sanitized **once, in the base Zod schema** via `.transform(sanitizeTextHtml)` — never with manual `sanitizeTextHtml(...)` calls on the frontend. Declaring it in the schema is the contract; the server enforces it during input validation, so the client never needs to re-sanitize or re-validate.

- `sanitizeHtml` and `sanitizeTextHtml` live in `@esposter/shared` (so `db-schema` schemas can import them). `sanitizeHtml` is the generic wrapper (table styling); `sanitizeTextHtml` adds the rich-text allowlist (mentions, code, links, inline styles).
- Applied to every rich-text field in the base `db-schema` model, transform-first then validators:
  ```ts
  // the base select schema
  foo: z.string().transform(sanitizeTextHtml).pipe(z.string().max(FOO_MAX_LENGTH)),
  ```
  Derived input schemas (`UpdateFooInput`, …) `.pick()` these fields and inherit the transform — never re-declare it.
- **No frontend sanitize on the send path.** `createMessage`/`updateMessage` pass raw `input` to the mutation; the zod boundary sanitizes. The brief optimistic render of your own message is self-XSS only (you typed it) and is replaced by the sanitized server echo.
- **Exception — localStorage drafts:** `setDraft` still calls `sanitizeTextHtml` because drafts are loaded into the editor without passing through a tRPC zod boundary.
- **Testing:** only the base `sanitizeHtml`/`sanitizeTextHtml` functions are unit-tested (in `@esposter/shared`). Schema wiring needs no test — declaring the transform is the contract. `marked.parse` is third-party and untested.
