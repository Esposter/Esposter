# Esbabbler — RBAC Spec

Discord-complexity permission system. Prerequisite for moderation and all privileged operations.

---

## Data Model

### `roomRoles` table

| Column        | Type      | Notes                                                                           |
| :------------ | :-------- | :------------------------------------------------------------------------------ |
| `id`          | uuid PK   | defaultRandom()                                                                 |
| `roomId`      | uuid FK   | → `rooms.id` CASCADE DELETE                                                     |
| `name`        | text      | NOT NULL; max 100 chars                                                         |
| `color`       | text      | nullable; hex color string                                                      |
| `position`    | integer   | NOT NULL DEFAULT 0; higher = higher priority                                    |
| `permissions` | bigint    | NOT NULL DEFAULT 0; bitfield of `RoomPermission` flags                          |
| `isEveryone`  | boolean   | NOT NULL DEFAULT false; at most one per room; applied to all members implicitly |
| `createdAt`   | timestamp | metadata                                                                        |
| `updatedAt`   | timestamp | metadata                                                                        |

Index: `(roomId, position DESC)`. Check: `position >= 0`. Partial unique index: one `isEveryone = true` per `roomId`.

### `usersToRoomRoles` table

| Column   | Type    | Notes                           |
| :------- | :------ | :------------------------------ |
| `userId` | text FK | → `users.id` CASCADE DELETE     |
| `roomId` | uuid FK | → `rooms.id` CASCADE DELETE     |
| `roleId` | uuid FK | → `roomRoles.id` CASCADE DELETE |

PK: `(userId, roomId, roleId)`.

> `@everyone` role (`isEveryone = true`) is never stored in `usersToRoomRoles` — applies to all members implicitly in every permission query.

---

## `RoomPermission` Bitfield Enum

`packages/db-schema/src/schema/roomRoles.ts`

> `bigint` is used over `number` so the bitfield can grow beyond 32 bits without overflow. TypeScript enums don't support `bigint` values — use a `const` object instead:

```typescript
export const RoomPermission = {
  // Text channel
  ReadMessages: 1n << 0n, // 1    — see message history / view channel
  SendMessages: 1n << 1n, // 2    — post messages
  ManageMessages: 1n << 2n, // 4    — delete/pin others' messages
  MentionEveryone: 1n << 3n, // 8    — use @here / @everyone
  // General
  ManageRoom: 1n << 4n, // 16   — edit room name, image, settings
  ManageRoles: 1n << 5n, // 32   — create/edit/delete roles below own top position
  ManageInvites: 1n << 6n, // 64   — create/delete invite codes
  // Moderation
  KickMembers: 1n << 7n, // 128  — remove a member from room
  BanMembers: 1n << 8n, // 256  — permanent ban
  MuteMembers: 1n << 9n, // 512  — force-mute/unmute in voice
  MoveMembers: 1n << 10n, // 1024 — kick from voice channel
  // Advanced — keep these last; Administrator must be the highest bit
  ManageWebhooks: 1n << 11n, // 2048 — create/edit/delete webhooks
  Administrator: 1n << 12n, // 4096 — all permissions; bypasses hierarchy checks; always the highest bit
} as const;

export type RoomPermission = (typeof RoomPermission)[keyof typeof RoomPermission];
```

> **Bit ordering rule**: `Administrator` must remain the highest-value bit so that future permissions can be inserted before it by shifting it up. New permissions go in front of `ManageWebhooks`/`Administrator`, incrementing their bit positions accordingly (requires a migration to update existing stored values).

---

## Permission Computation

SQL `BIT_OR` at query time. Owner (`rooms.userId`) bypasses entirely.

```sql
SELECT BIT_OR(rr.permissions)::bigint AS permissions
FROM room_roles rr
WHERE rr.room_id = $roomId
  AND (
    rr.is_everyone = TRUE
    OR rr.id IN (
      SELECT role_id FROM users_to_room_roles
      WHERE user_id = $userId AND room_id = $roomId
    )
  )
```

`Administrator` bit set → treat all bits as 1.

---

## Authority Hierarchy

```text
Owner (rooms.userId)          — immune to all role manipulation; can do everything
  └── Administrator permission — bypass all checks; can manage all roles below top
        └── Explicit permissions  — granular; subject to role hierarchy
              └── @everyone perms — baseline for all room members
```

---

## Role Hierarchy Rules

- User's **top position** = max `position` across explicitly-assigned roles (not @everyone).
- Owner's top position = `+Infinity`.
- User can only assign/remove/edit/delete roles with `position < their own top`.
- `Administrator` bypasses hierarchy (but not Owner status).

---

## Default Role Permissions

| Role        | Default permissions                                                                                                       |
| :---------- | :------------------------------------------------------------------------------------------------------------------------ |
| `@everyone` | `ReadMessages \| SendMessages \| MentionEveryone \| ManageInvites`                                                        |
| `Admin`     | `ManageRoom \| ManageRoles \| ManageInvites \| KickMembers \| BanMembers \| MuteMembers \| MoveMembers \| ManageMessages` |

---

## Service Layer (`server/services/room/rbac/`)

| Function                                                        | Returns            | Notes                                                                                                        |
| :-------------------------------------------------------------- | :----------------- | :----------------------------------------------------------------------------------------------------------- |
| `getPermissions(db, userId, roomId)`                            | `Promise<bigint>`  | SQL `BIT_OR` over @everyone + assigned roles                                                                 |
| `hasPermission(db, userId, roomId, permission: RoomPermission)` | `Promise<boolean>` | Owner bypass → `Administrator` bit → specific bit                                                            |
| `getTopRolePosition(db, userId, roomId)`                        | `Promise<number>`  | Max position across assigned roles (not @everyone)                                                           |
| `isManageable(db, actorId, roomId, targetPosition: number)`     | `Promise<boolean>` | Actor's top > targetPosition. For a user: resolve their top first; for a role: pass `role.position` directly |

---

## tRPC Procedure Guards

| Guard                                                    | When to use                                                   |
| :------------------------------------------------------- | :------------------------------------------------------------ |
| `getOwnerProcedure(schema, roomIdKey)`                   | Owner-only: `deleteRoom`, `transferOwnership`                 |
| `getPermissionsProcedure(permission, schema, roomIdKey)` | Any procedure requiring a specific permission; owner bypasses |

`getCreatorProcedure` retired — replaced by `getOwnerProcedure` and `getPermissionsProcedure`.

---

## Implementation Tasks

- [x] **`RoomPermission` const object + type alias** — `packages/db-schema/src/schema/roomRoles.ts`
- [x] **`roomRoles` Drizzle schema** — `packages/db-schema/src/schema/roomRoles.ts`; partial unique index on `(roomId) WHERE isEveryone = true`
- [x] **`usersToRoomRoles` Drizzle schema** — `packages/db-schema/src/schema/usersToRoomRoles.ts`
- [ ] **Migration** — add both tables; seed one `@everyone` role for every existing room
- [x] **RBAC service functions** — `server/services/room/rbac/` (4 functions above)
- [ ] **`getOwnerProcedure`** — `server/trpc/procedure/room/getOwnerProcedure.ts`
- [x] **`getPermissionsProcedure`** — `server/trpc/procedure/room/getPermissionsProcedure.ts`
- [ ] **Wire up `createRoom`** — transaction inserts @everyone role + optional Admin role
- [ ] **Retire `getCreatorProcedure`** — migrate callers: `updateRoom` → `ManageRoom`, `createMembers` → `ManageRoom`, `deleteMember` → `KickMembers`
- [x] **`roleRouter`** — `server/trpc/routers/role.ts`
  - `createRole({ roomId, name, color?, permissions?, position? })` — behind `ManageRoles` + `canManageRole(position)`
  - `updateRole({ id, roomId, ...partial })` — behind `ManageRoles` + `canManageRole(role.position)`
  - `deleteRole({ id, roomId })` — behind `ManageRoles` + `canManageRole(role.position)`
  - `readRoles({ roomId })` — behind `getMemberProcedure`; returns all roles sorted by position DESC
  - `assignRole({ roomId, userId, roleId })` — behind `ManageRoles` + `canManageRole(role.position)` + `canManageTarget`
  - `revokeRole({ roomId, userId, roleId })` — same guards as `assignRole`
  - `onUpdateRole({ roomId })` — subscription; emits on create/update/delete role or assign/revoke
- [ ] **`readMembers` enrichment** — include each member's roles (sorted by position DESC)
- [x] **Role assignment UI** — + button on Permissions tab opens Discord-style dropdown to search and assign members to roles (`Permissions/AddMemberMenu.vue`)
- [ ] **Tests** — `server/services/room/rbac/*.test.ts` for `getPermissions`, `hasPermission`, `getTopRolePosition`, `isManageable`; `server/trpc/routers/role.test.ts` for all `roleRouter` procedures (CRUD, assign/revoke), owner bypass, Administrator bypass, hierarchy enforcement
