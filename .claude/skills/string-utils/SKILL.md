---
name: string-utils
description: Esposter string normalization conventions — normalizeString replaces all .trim() usages; never use .trim() outside Zod schemas and the base function itself.
---

# String Normalization

## `normalizeString`

Trims whitespace and returns empty string for absent/null/undefined inputs. Lives in `@esposter/shared`.

```ts
import { normalizeString } from "@esposter/shared";

normalizeString("  hello  "); // → "hello"
normalizeString("   "); // → ""
normalizeString(""); // → ""
normalizeString(null); // → ""
normalizeString(undefined); // → ""
```

## Convention: `string` not `string | null`

Optional text fields use empty string as the "absent" sentinel — never `null`:

- DB column: `text("field").notNull().default("")`
- TypeScript type: `string` (not `string | null`)
- Zod schema: `z.string().trim().max(N)` in the base `selectXxxSchema` (never in derived schemas)

## When to use `normalizeString`

Use everywhere a string needs trimming **except** the two cases below:

- tRPC mutation inputs: `normalizeString(topic.value)`
- Event handlers: `@update:model-value="group = normalizeString($event)"`
- Parsing (CSV, XLSX, clipboard): `normalizeString(cell?.toString())`
- Array mapping: `values.map(normalizeString).filter(Boolean)`
- Guard checks: `if (!normalizeString(value)) return;`
- Filter predicates: `.filter((line) => normalizeString(line) !== "")`

## When NOT to use `normalizeString`

Only two exceptions:

1. **Zod schemas** — use `.trim()` in the schema transform step (`.trim().max(N)`)
2. **The `normalizeString` function itself** — obviously

`.trimStart()` and `.trimEnd()` are separate methods — replace only when semantically equivalent to a full `.trim()`.

## Preserve `undefined` when needed

When the old value in a `watch` callback must stay `undefined` to signal "first render" (distinct from an empty string that was previously seen):

```ts
const sanitizedOld = oldValue !== undefined ? normalizeString(oldValue) : oldValue;
```

## Zod Schema Alignment

Base select schemas use `.trim().max(N)` so server validation matches client normalization:

```ts
// In selectRoomInMessageSchema override:
topic: z.string().trim().max(ROOM_TOPIC_MAX_LENGTH),

// In selectSurveySchema override:
group: z.string().trim().max(SURVEY_GROUP_MAX_LENGTH),
```

Never add trim transforms to derived schemas (`UpdateRoomInput`, `UpdateSurveyInput` etc.) — only in the base select schema.
