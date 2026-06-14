---
name: string-utils
description: Esposter string normalization and HTML sanitization conventions — normalizeString replaces all .trim() usages everywhere including Zod schemas; sanitizeMessageHtml is declared at the Zod boundary in base db-schema schemas (never manual frontend calls). Exception — user-facing transformation actions and localStorage drafts.
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
- Zod schemas: see Zod Schema Alignment below

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

Base select schemas use `.transform(normalizeString)` so server validation matches client normalization. Always transform first, then validators in the pipe. Never add trim transforms to derived schemas (`UpdateRoomInput`, `UpdateSurveyInput`, etc.) — only in the base select schema.

```ts
topic: z.string().transform(normalizeString).pipe(z.string().max(ROOM_TOPIC_MAX_LENGTH)),
export const createNameSchema = (maxLength: number) =>
  z.string().transform(normalizeString).pipe(z.string().min(1).max(maxLength));
```

## HTML Sanitization at the Zod Boundary

Same principle as `normalizeString`: HTML message content is sanitized **once, in the base Zod schema** via `.transform(sanitizeMessageHtml)` — never with manual `sanitizeMessageHtml(...)` calls on the frontend. Declaring it in the schema is the contract; the server enforces it during input validation, so the client never needs to re-sanitize or re-validate.

- `sanitizeHtml` and `sanitizeMessageHtml` live in `@esposter/shared` (so `db-schema` schemas can import them). `sanitizeHtml` is the generic wrapper (table styling); `sanitizeMessageHtml` adds the message allowlist (mentions, code, links, inline styles).
- Applied to every message-content field in the base `db-schema` model, transform-first then validators:
  ```ts
  // BaseMessageEntity.ts
  message: z.string().transform(sanitizeMessageHtml).pipe(z.string().max(MESSAGE_MAX_LENGTH)).default(""),
  // ScheduledMessage / Reminder payloads
  message: z.string().transform(sanitizeMessageHtml).pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  text: z.string().transform(sanitizeMessageHtml).pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  ```
  Derived input schemas (`UpdateMessageInput`, `ScheduleMessageInput`, …) `.pick()` these fields and inherit the transform — never re-declare it.
- **No frontend sanitize on the send path.** `createMessage`/`updateMessage` pass raw `input` to the mutation; the zod boundary sanitizes. The brief optimistic render of your own message is self-XSS only (you typed it) and is replaced by the sanitized server echo.
- **Exception — localStorage drafts:** `setDraft` still calls `sanitizeMessageHtml` because drafts are loaded into the editor without passing through a tRPC zod boundary.
- **Testing:** only the base `sanitizeHtml`/`sanitizeMessageHtml` functions are unit-tested (in `@esposter/shared`). Schema wiring needs no test — declaring the transform is the contract. `marked.parse` is third-party and untested.
