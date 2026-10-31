# Records

Read when a schema holds a record — a map from free-text keys to values.

**A record is `createRecordSchema(keySchema, valueSchema, maxEntries)`** from `@esposter/shared`, never a bare `z.record(…)`. Zod bounds a record's keys and values one at a time but never how many entries it holds, so an uncapped record accepts as many as the request body allows. The helper adds the cap as a refinement and states it as `maxProperties` in the schema's JSON Schema, which is what the request-bounds guard reads (`apps/web/server/trpc/routers/index.test.ts`).

- **The entry count is a named `MAX_*` constant**, reusing one that already holds the limit (the `zod` skill's "A limit is a named constant").
- **The key schema carries its own length**, since the guard reads it as a string of its own.
- **A record keyed by an enumeration takes no cap** — `z.partialRecord(z.enum(…), …)` is bounded by its keys.
