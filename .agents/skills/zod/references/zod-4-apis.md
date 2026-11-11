# Zod 4 APIs

Read when writing a format validator, a numeric refinement, an enum schema, a refinement's error text, or pushing an issue onto a `ZodError`. Most of it is `no-restricted-syntax`; this page is the rest and the why.

- **Format validators and numeric refinements are Zod 4's top-level builders** — `z.email()`, `z.int()`, `z.iso.datetime()`, `z.strictObject({...})` — never the Zod 3 chain or `z.nativeEnum` (`no-restricted-syntax`, whose message names each replacement).
- `z.uuid()` validates RFC 9562/4122 versions 1 to 8, the nil UUID and the max UUID — use `z.guid()` for permissive "UUID-like" validation. Ids are validated with `z.uuidv4()`: every id the app mints for its own rows is a v4, and every fixed id (`ZERO_UUID` and its last-digit steps) is v4-shaped, so a fixed id is never the pure nil (`openspec/changes/architecture-strict-uuid-v4/design.md`). drizzle-zod maps every Postgres `uuid` column to `z.uuid()`, so each uuid column is overridden in its select schema, `id: () => z.uuidv4()`, and a new uuid column takes the same override.
- **`z.enum(MyEnum)`** directly for TS string enums.
- **A refinement's custom text goes under `error`** — `.refine(check, { error: "…", path: [...] })`, never Zod 3's `message` (`no-restricted-syntax`), which still parses and so leaves two spellings of one key in the same tree. The `message` key inside a pushed issue is a different object and keeps its name.
- **Never `.addIssue()` / `.addIssues()` on a `ZodError`** (deprecated in Zod 4) — push directly: `myError.issues.push({ code: "custom", message: "..." })`. `ctx.addIssue()` inside `superRefine` is still valid (it operates on the refinement context, not a `ZodError`).
