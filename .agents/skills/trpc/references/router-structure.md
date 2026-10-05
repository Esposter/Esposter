# Router Structure

Read when adding a router, a sub-router or a router key, or deciding how routers and stores map to tables.

Routers nested by domain. Root merger: `server/trpc/routers/index.ts`. The client path mirrors the file path segment for segment — `trpc.<feature>.*` is `routers/<feature>/index.ts` and `trpc.<feature>.<sub>.*` is `routers/<feature>/<sub>.ts` — so a nested key is never flattened, and the file for any path is derivable rather than looked up. The two diverge only where a key was renamed to dodge a `Function.prototype` collision.

- **Sub-routers compose in the feature's own `index.ts`** — export a `base*Router` with the feature's own procedures, then `mergeRouters` it with the sub-routers. `routers/index.ts` imports only the composed router, never a sub-router directly.

  ```ts
  // routers/foo/index.ts — the composition root
  export const baseFooRouter = router({ createFoo: ..., updateFoo: ... });
  export const fooRouter = mergeRouters(baseFooRouter, router({ bar: barRouter }));
  ```

- **Exception**: `achievement` is merged separately (via `mergeRouters`) to avoid a circular dep with the router that fires achievement events.
- **Never use `call`, `apply`, `bind`, `then`, `catch` as router keys** (`trpc-procedure/no-prototype-key`) — they are `Function.prototype` methods, and tRPC clients use a `Proxy`, so `.call` returns `Function.prototype.call` instead of descending the router, silently breaking the namespace. Use a descriptive compound name: `callSession`, `fooCall`.

## One router and one store per table

- **One router + one Pinia store per DB table** — never bundle multiple tables into one router or store.
- **Membership is the parent entity's** — joining, leaving and listing who belongs (`room.joinRoom`, `room.leaveRoom`, `room.readMembers`, `room.readMembersCount`) stay on the parent's router though they touch the join table, because they read and write the relation as the parent sees it and return the parent or the users. The join table's own router (`userToRoom`) holds the row's own fields — a nickname, a mention count, a member's notification settings.
- **Naming derived from the table name, not semantics** — `foo_bars` → `fooBars` store ref and `readFooBars` procedure, never a semantic rename of the same rows (the table implies the state).
- **A store reaching another imports it by path** — only `composables/**` is auto-imported — and the two reach each other one way only (the `pinia` skill, `references/consuming-a-store.md`).
