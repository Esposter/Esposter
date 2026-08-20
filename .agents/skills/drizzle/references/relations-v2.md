# Drizzle v2 relations

Read when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`. The headline rules (no v1 `relations()`, object-based syntax, `createSelectSchema` from `drizzle-orm/zod`) are in `SKILL.md`.

## File structure

- Relations live in separate files under `packages/db-schema/src/relations/`, one file per table (e.g. `foosRelation.ts`).
- **Never define relations inside schema files** — `packages/db-schema/src/schema/*.ts` must not import `relations` from `drizzle-orm` or define any `*Relations`.
- Register every relation file in `packages/db-schema/src/relations.ts` (both the import and the spread into the `relations` export), and every table and `pgEnum` in the `schema` object in `packages/db-schema/src/schema.ts`.

```ts
// packages/db-schema/src/relations/foosRelation.ts
import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const foosRelation = defineRelationsPart(schema, (r) => ({
  foos: {
    bar: r.one.bars({ from: r.foos.barId, optional: false, to: r.bars.id }),
  },
}));
```

## `optional: false`

- Always set `optional: false` on `r.one` when the FK column is `notNull()`. v2 defaults to optional (nullable result), producing wrong types (`bar: Bar | null` instead of `bar: Bar`).
- Omit `optional` (or set `true`) only when the FK column is nullable (e.g. soft-delete style optional FK).

## Naming

- **`r.one` → singular, descriptive name after what it represents, not the table**: FK to `foos` → `foo`, named after the role it plays whenever that differs from the table.
- **`r.many` → camelCase plural after the junction/child table**: `foosToBars`.
- **Through (many-to-many) → `{target}Via{JunctionTable}`**: `foosViaBazes`.
- **The two better-auth tables are the exception**: `sessions` and `accounts` name their `r.one` to a user `users`, after the table, because better-auth's drizzle adapter derives the relation key it joins on from the schema table key. Renaming either to the singular turns every session read back into two queries, or throws — see `packages/app/content/docs/architecture/auth.md`.
- **`alias` required for through relations** — format `"{targetTable}_id_{sourceTable}_id_via_{junctionTable}"`, e.g. `"bars_id_foos_id_via_bazes"` for a `foosViaBazes` relation defined on `bars`.

## `where` syntax

Object-based, not callbacks. **Almost never use `RAW:`** — all common operators have object syntax:

```ts
where: { id: { eq: input }, barId: { eq: barId } }            // implicit AND
where: { deletedAt: { isNull: true } }                        // isNull / isNotNull
where: { OR: [{ fooId: { eq: id } }, { barId: { eq: id } }] }
where: {                                                      // nested OR; each OR element is implicitly ANDed
  OR: [
    { fooId: { eq: id }, barId: { eq: targetId } },
    { fooId: { eq: targetId }, barId: { eq: id } },
  ],
}
where: { NOT: { id: { gt: 10 } } }
where: { position: { gte: 0 } }   // other operators: gt, gte, lt, lte, ne, in, notIn, like, ilike

// WRONG — v1 callback syntax (incompatible with v2)
where: (foos, { and, eq }) => and(eq(foos.id, input), eq(foos.barId, barId)),
```

**Use `RAW:` ONLY for operators with no object equivalent** — currently `EXISTS` subqueries, `isNull` on a join condition (not a column filter), or raw SQL. When using `RAW:`, always guard against `undefined`:

```ts
where: {
  RAW: (foos, { and, eq, exists }) => {
    const where = and(eq(foos.id, input), exists(...));
    if (!where) throw new InvalidOperationError(...);
    return where;
  },
},
```

## `orderBy` syntax

```ts
orderBy: { createdAt: "desc" }
orderBy: { position: "asc", name: "asc" }

// WRONG — v1 callback syntax
orderBy: (table, { asc }) => [asc(table.position)]
```

## `with:` eager loading workaround

Due to [drizzle-team/drizzle-orm#695](https://github.com/drizzle-team/drizzle-orm/issues/695), eager-loaded relation shapes must be a constant object exported from the relation file. Define `XxxWithRelations` types inline right after the constant. Consumers import both from `@esposter/db-schema`:

```ts
// foosRelation.ts
export const FooRelations = { bar: true } as const;
export type FooWithRelations = Foo & { bar: Bar };

// In the router
const result = await ctx.db.query.foos.findFirst({ where: { ... }, with: FooRelations });
```
