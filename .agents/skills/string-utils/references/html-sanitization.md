# HTML Sanitization

Read when a field holds user-authored rich-text HTML, or a sanitize call is about to be written.

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
