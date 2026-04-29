---
name: string-utils
description: Esposter string normalization conventions — normalizeString for trim+null coercion, when to use it vs raw .trim(), and Zod schema alignment.
---

# String Normalization

## `normalizeString`

Trims whitespace and coerces empty/whitespace-only strings to `null`. Lives in `@esposter/shared`.

```ts
import { normalizeString } from "@esposter/shared";

normalizeString("  hello  "); // → "hello"
normalizeString("   "); // → null
normalizeString(""); // → null
normalizeString(null); // → null
normalizeString(undefined); // → null
```

## When to use `normalizeString`

Use it whenever a string field can be "absent" (null in DB) — i.e. whitespace-only should be treated the same as empty.

- tRPC mutation inputs: `topic: normalizeString(topic.value)`
- Event handlers that coerce to null: `@update:model-value="group = normalizeString($event)"`
- Optional text params before mutations: `const topic = normalizeString(command.parameterValues.text)`
- Fallback to empty string: `normalizeString(text) ?? ""`

## When NOT to use `normalizeString`

Keep raw `.trim()` for:

- **Validation checks**: `!value.trim()`, `value.trim() !== ""`
- **Internal parsing** (CSV, XLSX, clipboard): `cell.toString().trim()`
- **String utilities** (prettify, getInitials): internal transformations where `""` is valid
- **The `Trim` column transformation** in table editor — `.trim()` is the explicit transform
- Zod schemas: use `.trim()` in `.transform()` steps; `normalizeString` is for runtime call sites

## Zod Schema Alignment

When `normalizeString` is used at the call site, the server-side Zod schema for the same field must also trim + coerce empty to null so validation matches:

```ts
// Schema field that accepts nullable string, normalizing whitespace
z.string()
  .trim()
  .transform((v) => v || null)
  .nullable();
// or if the field is optional with null fallback:
z.string()
  .trim()
  .nullish()
  .transform((v) => v?.trim() || null);
```

This ensures client-side normalization and server-side validation agree — a whitespace-only value is always null in the DB.
