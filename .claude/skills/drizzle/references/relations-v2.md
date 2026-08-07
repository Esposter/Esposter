# Drizzle v2 relations

Read when adding or editing a file in `packages/db-schema/src/relations/`, or writing a relational query's `where` / `orderBy` / `with`. The headline rules (no v1 `relations()`, object-based syntax, `createSelectSchema` from `drizzle-orm/zod`) are in `SKILL.md`.

## File structure

- Relations live in separate files under `packages/db-schema/src/relations/`, one file per table (e.g. `friendsRelation.ts`).
- **Never define relations inside schema files** — `packages/db-schema/src/schema/*.ts` must not import `relations` from `drizzle-orm` or define any `*Relations`.
- Register every relation file in `packages/db-schema/src/relations.ts` (both the import and the spread into the `relations` export), and every table and `pgEnum` in the `schema` object in `packages/db-schema/src/schema.ts`.

```ts
// packages/db-schema/src/relations/friendsRelation.ts
import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendsRelation = defineRelationsPart(schema, (r) => ({
  friends: {
    receiver: r.one.users({ from: r.friends.receiverId, optional: false, to: r.users.id }),
    sender: r.one.users({ from: r.friends.senderId, optional: false, to: r.users.id }),
  },
}));
```

## `optional: false`

- Always set `optional: false` on `r.one` when the FK column is `notNull()`. v2 defaults to optional (nullable result), producing wrong types (`user: User | null` instead of `user: User`).
- Omit `optional` (or set `true`) only when the FK column is nullable (e.g. soft-delete style optional FK).

## Naming

- **`r.one` → singular, descriptive name after what it represents, not the table**: FK to `users` → `user`, `rooms` → `room`, `appUsers` (bot) → `appUser`.
- **`r.many` → camelCase plural after the junction/child table**: `usersToRooms`, `webhooksInMessages`.
- **Through (many-to-many) → `{target}Via{JunctionTable}`**: `usersViaInvitesInMessage`, `postsViaLikes`.
- **`alias` required for through relations** — format `"{targetTable}_id_{sourceTable}_id_via_{junctionTable}"`, e.g. `"rooms_id_users_id_via_invitesInMessage"`.

## `where` syntax

Object-based, not callbacks. **Almost never use `RAW:`** — all common operators have object syntax:

```ts
where: { id: { eq: input }, userId: { eq: userId } }          // implicit AND
where: { deletedAt: { isNull: true } }                        // isNull / isNotNull
where: { OR: [{ receiverId: { eq: userId } }, { senderId: { eq: userId } }] }
where: {                                                      // nested OR; each OR element is implicitly ANDed
  OR: [
    { blockerId: { eq: userId }, blockedId: { eq: targetId } },
    { blockerId: { eq: targetId }, blockedId: { eq: userId } },
  ],
}
where: { NOT: { id: { gt: 10 } } }
where: { position: { gte: 0 } }   // other operators: gt, gte, lt, lte, ne, in, notIn, like, ilike

// WRONG — v1 callback syntax (incompatible with v2)
where: (rooms, { and, eq }) => and(eq(rooms.id, input), eq(rooms.userId, userId)),
```

**Use `RAW:` ONLY for operators with no object equivalent** — currently `EXISTS` subqueries, `isNull` on a join condition (not a column filter), or raw SQL. When using `RAW:`, always guard against `undefined`:

```ts
where: {
  RAW: (rooms, { and, eq, exists }) => {
    const where = and(eq(rooms.id, input), exists(...));
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
// usersToRoomsInMessageRelation.ts
export const UserToRoomInMessageRelations = { roomInMessage: true, user: true } as const;
export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { roomInMessage: RoomInMessage; user: User };

// In the router
const result = await ctx.db.query.usersToRoomsInMessage.findFirst({ where: { ... }, with: UserToRoomInMessageRelations });
```
