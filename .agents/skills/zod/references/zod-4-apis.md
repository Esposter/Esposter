# Zod 4 APIs

Read when writing a format validator, a numeric refinement, an enum schema, a refinement's error text, or pushing an issue onto a `ZodError`. Most of it is `no-restricted-syntax`; this page is the rest and the why.

- **Format validators and numeric refinements are Zod 4's top-level builders** — `z.email()`, `z.int()`, `z.iso.datetime()`, `z.strictObject({...})` — never the Zod 3 chain or `z.nativeEnum` (`no-restricted-syntax`, whose message names each replacement).
- `z.uuid()` strictly validates RFC 9562/4122 — use `z.guid()` for permissive "UUID-like" validation.
- **`z.enum(MyEnum)`** directly for TS string enums.
- **A refinement's custom text goes under `error`** — `.refine(check, { error: "…", path: [...] })`, never Zod 3's `message` (`no-restricted-syntax`), which still parses and so leaves two spellings of one key in the same tree. The `message` key inside a pushed issue is a different object and keeps its name.
- **Never `.addIssue()` / `.addIssues()` on a `ZodError`** (deprecated in Zod 4) — push directly: `myError.issues.push({ code: "custom", message: "..." })`. `ctx.addIssue()` inside `superRefine` is still valid (it operates on the refinement context, not a `ZodError`).
