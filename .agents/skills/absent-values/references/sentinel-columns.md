# Sentinel Columns

Read when adding an optional column, or inserting a value that may be absent. The one-line rule is in `SKILL.md`; this page is every column kind and the insert side.

## Empty-sentinel columns

The schema carries the empty-sentinel convention itself so types and defaults propagate end-to-end through Drizzle's inference — never store `null` and map a sentinel to/from it in app code.

- **`.notNull().default("")` for optional user-editable text fields** — `""` is the canonical absent value (biography, color, topic, description), never `null`.
- **`.notNull().default(0)` for optional numeric fields where `0` has no domain meaning** — e.g. a capacity column `maxFoos`: `0` = unlimited. CHECK constraints treat the sentinel explicitly (`maxFoos = 0 OR foos <= maxFoos`), and queries compare against it (`eq(column, 0)`), not `isNull`.
- **Timestamps keep `null` for absence** — a timestamp has no empty value (`expiresAt`: null = never expires). The mapping from the input's sentinel happens once at the insert site.
- **Keep `null` only for semantically distinct absence** — URL fields (`""` would fail URL validation); fields a CHECK constraint forces to `null` for some row type; nullable FKs where `null` means the referenced row was deleted (audit trail); auth-framework-managed tables (`accounts`, `sessions`), which are not to be touched.
- **Update downstream `??` fallbacks to `||`** when a field changes nullable → `""` — `"" ?? fallback` returns `""`.

## Optional insert values

Do not coerce `undefined` to `null` with `?? null` unless null has distinct domain meaning. Omit the key or pass the existing optional value directly. Use explicit `null` only when the schema distinguishes null from absence (nullable FKs, audit fields).
