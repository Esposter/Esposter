# `.returning()`

Read when a write returns its rows. The one-line rule is in `SKILL.md`; this page is the five rules in full.

1. **Wrap the first element in `requireMutation`** — never hand-roll the undefined guard, never fall back to `?? []` / `?? null`. See the `error-handling` skill (`references/server-guards.md`).
2. **Return the full entity** — never a subset of fields. Let callers destructure what they need.
3. **Add `DatabaseEntityType` if missing** — to `packages/db-schema/src/models/shared/DatabaseEntityType.ts`.
4. **`[0]`, not `takeOne`, when a guard consumes the result.** `takeOne` is a type-level assertion that erases `undefined` from the element type, so it is for access whose absence would be a bug. A row that may legitimately be absent keeps `[0]`: `undefined` is precisely what `requireMutation`, `requireEntity` and a `!row` branch exist to read. Putting `takeOne` in front of a guard types the absent case out of existence and leaves the guard unreachable — the same applies to a locked `SELECT … FOR UPDATE` standing in for `findFirst`, whose whole contract is `T | undefined`.
5. **An empty result is also how a claim is lost, and that is the one exception to rule 1.** Where the write's precondition is a fact about the row, the predicate goes in the `WHERE`, and no returned row means contention — inspect `[0]` directly; a `findFirst` that decides whether to write is the check-then-act that page names (`apps/web/content/docs/architecture/conditional-writes.md`). `requireMutation` is for every other mutation.
