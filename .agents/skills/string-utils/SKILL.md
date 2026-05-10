---
name: string-utils
description: Esposter string normalization conventions — normalizeString replaces all .trim() usages everywhere including Zod schemas; only exception is user-facing transformation actions.
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
- Zod schema: `.max(N).transform(normalizeString)` in the base `selectXxxSchema` (never in derived schemas)

## When to use `normalizeString`

Use everywhere a string needs trimming:

- tRPC mutation inputs: `normalizeString(topic.value)`
- Event handlers: `@update:model-value="group = normalizeString($event)"`
- Parsing (CSV, XLSX, clipboard): `normalizeString(cell?.toString())`
- Array mapping: `values.map(normalizeString).filter(Boolean)`
- Guard checks: `if (!normalizeString(value)) return;`
- Filter predicates: `.filter((line) => normalizeString(line) !== "")`
- Zod schemas: always `z.string().transform(normalizeString).pipe(z.string().min(1).max(N))` — transform first, then validators in the pipe

## When NOT to use `normalizeString`

Only two exceptions:

1. **User-facing transformation actions** — e.g. `computeStringTransformation.ts` `Trim` case; keep `value.trim()` since it's implementing a named user operation
2. **The `normalizeString` function itself** — obviously

`.trimStart()` and `.trimEnd()` are separate methods — replace only when semantically equivalent to a full `.trim()`.

## Preserve `undefined` when needed

When the old value in a `watch` callback must stay `undefined` to signal "first render" (distinct from an empty string that was previously seen):

```ts
const sanitizedOld = oldValue !== undefined ? normalizeString(oldValue) : oldValue;
```

## Zod Schema Alignment

Base select schemas use `.transform(normalizeString)` so server validation matches client normalization:

```ts
// Always: transform first, validators in pipe
topic: z.string().transform(normalizeString).pipe(z.string().max(ROOM_TOPIC_MAX_LENGTH)),
group: z.string().transform(normalizeString).pipe(z.string().max(SURVEY_GROUP_MAX_LENGTH)),
export const createNameSchema = (maxLength: number) =>
  z.string().transform(normalizeString).pipe(z.string().min(1).max(maxLength));
```

Never add trim transforms to derived schemas (`UpdateRoomInput`, `UpdateSurveyInput` etc.) — only in the base select schema.
