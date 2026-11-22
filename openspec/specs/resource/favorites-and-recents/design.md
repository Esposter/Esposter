# Favorites & Recents

Two sets answer "take me back to what I was working on": **Favorites**, the resources you starred, and **Recent**, the ones you actually opened. Each renders twice — as a tab on Home for a quick glance, and as a full list route off the [service menu](../resource-service-menu/design.md) where it can be filtered, sorted and acted on in bulk.

## How it works

Both are relationship tables in D1, keyed on `(userId, resourceId)` and cascading on both sides.

Both are server-side rather than per-device. A star that vanishes on another machine reads as data loss, and a recent list is no different once it is a list route with a visible `Last accessed` column: a column that disagrees between two browsers is indefensible in a way a quietly-different card is not.

Recent means recently _opened_, which `updatedAt` desc does not approximate: it is wrong the moment anything autosaves, because a resource you never opened jumps to the top when a background save touches it. Opening a resource page calls `resource.recordAccess` through `useRecordResourceAccess`, which watches the resource's **identity**, not the object — autosave, rename and tag edits each replace the object, so re-recording on those would order Recent by last autosave instead. The write is best-effort and silent on failure: it records that a visit happened, and the visit itself succeeded.

```mermaid
flowchart LR
  OPEN["resource page load"] -->|"useRecordResourceAccess → resource.recordAccess"| ACC[("resource_accesses<br/>userId + resourceId, accessedAt")]
  ACC -->|"left join, caller-scoped"| READ["resource.readResources"]
  READ -->|"isAccessed: true, opened-first"| RECENT["/recents · Home Recent tab · the palette's resources scope"]
  READ -->|"isFavorite: true"| FLIST["/favorites"]
  READ -->|"lastAccessedAt column"| ALL["/all workbench"]
  READ -->|"each row's star, a left join"| FAV
  STARL["star column on /all"] --> TGL["resource.toggleFavorite"]
  STARB["star on the resource's title row"] --> TGL
  STARH["a Home row's context menu"] --> TGL
  TGL --> FAV[("resource_favorites<br/>userId + resourceId")]
  FAV -->|resource.readFavorites| FTAB["Home · Favorites tab"]
  RES[("resources")] -->|FK cascade on delete| FAV
  RES -->|FK cascade on delete| ACC
```

## Data model

`resourceFavorites` carries nothing but the relationship: a `userId` + `resourceId` composite primary key and the inherited `createdAt`, which is the Favorites tab's sort key (most recently starred first).

`resourceAccesses` adds one column to that shape — `accessedAt`, rewritten on every open by an upsert, so the table stays bounded by what exists rather than growing with traffic. Its own index on `(userId, accessedAt)` is what keeps "this user's rows, newest first" from re-sorting every resource they have ever opened; the primary key orders by `resourceId` and cannot serve that.

It is deliberately not called a view. The `resourceViews` table counts anonymous hits on a _published_ resource ([published view analytics](../published-view-analytics/design.md)); this records the owner opening their own.

A star is a toggle, and `toggleFavorite` implements it as a delete-then-insert rather than a read-then-branch: the delete's own `returning()` reports whether the star was set, so the toggle cannot race with itself and report the wrong new state. The client takes that answer as authoritative rather than keeping its optimistic flip — a list that went stale (another tab starred the same row first) flips the wrong way, and nothing else would ever reconcile it.

## Procedures

| Procedure                 | Auth   | Input               | Purpose                                                               |
| ------------------------- | ------ | ------------------- | --------------------------------------------------------------------- |
| `resource.toggleFavorite` | owner  | `{ id }`            | Insert/delete the favorite row, returns new state                     |
| `resource.readFavorites`  | authed | `{ cursor, limit }` | Live stars joined to live resources, newest starred, a page at a time |
| `resource.recordAccess`   | owner  | `{ id }`            | Upsert this user's access row for the resource                        |

The list routes use neither of the reads above: they are `resource.readResources` with `isFavorite: true` or `isAccessed: true`, so they inherit the whole workbench. `readFavorites` serves Home's Favorites tab. Every resource read answers each of its rows with the viewer's own star beside it (a left join on the star, tombstones included), so no list reads the whole set to know which of its rows are starred.

## Key files

| File                                                                    | Role                                     |
| ----------------------------------------------------------------------- | ---------------------------------------- |
| `packages/db-schema/src/schema/resource/resourceFavoritesInResource.ts` | Favorites table                          |
| `packages/db-schema/src/schema/resource/resourceAccessesInResource.ts`  | Access table (one row per user/resource) |
| `server/trpc/routers/resource.ts`                                       | Toggle/read/record procedures, filters   |
| `app/store/resource/favorite.ts`                                        | Favorites store, its paged list + toggle |
| `app/composables/resource/useReadFavorites.ts`                          | Favorites list's page reads              |
| `app/components/Resource/FavoriteToggle.vue`                            | The star, shared by the list and blade   |
| `app/composables/resource/useRecordResourceAccess.ts`                   | Identity-watching access write           |
| `app/store/resource/recent.ts`                                          | Recents store + capped opened-first read |
| `app/components/Resource/Home/ResourcesSection.vue`                     | Home Recent/Favorites tabs               |

## Notes

- The `/all` star renders always rather than on hover: hover does not exist on touch, and a star you cannot find is a star you do not use.
- A row's star travels with the row. Each resource read answers its rows with the star beside them, and the client holds that star on the favorites overlay table, so every surface that shows the row reads the same star and a star set or removed on one row reaches every other. No list reads the whole set to know its stars, and no store keeps one.
- The favorites list is a page of the starred rows, read by `readFavorites` a page at a time, keyset-paged by the star's time and the resource's id, the most recently set first. Each row is drawn from the overlay, so a star removed here or elsewhere, or a resource deleted, leaves the list at once, whichever page named it.
- Soft-deleted resources are filtered out of every read here, so a starred resource sitting in the [recycle bin](../recycle-bin/design.md) disappears from Favorites and returns when restored — the star itself is never lost. The same is true of an access row.
- The palette's resources scope reads the same server-side set for its **Recently opened** group, so it and the Recent route can never disagree. Recent _searches_ stay in `localStorage`: a query you typed is not something to follow you between machines.
- Recents are a store for the same reason favorites are: Home mounts the Recent tab and registers the palette's resources scope together, and both want the same capped list.
