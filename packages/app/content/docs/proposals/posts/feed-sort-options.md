---
title: Feed sort options
description: Proposal — a Hot / New / Top sort toggle on the home feed, backed by the sortBy the procedure already accepts.
---

# Feed Sort Options

Let readers switch the feed between Hot (ranking), New (newest first), and Top (most liked). `readPosts` already accepts arbitrary `sortBy` through the shared cursor-pagination params — the UI just never sends anything but the default, so the feature is a toggle plus a store parameter.

## Scope

**Today:** the feed always reads with the default `[{ key: "ranking", order: desc }]`; the cursor machinery (`getCursorWhere`, `parseSortByToSql`) is sort-agnostic.

**This adds:** a `v-btn-toggle` (Hot / New / Top) above the feed, a `sortBy` ref in the post store threaded into `useReadPosts`, and a reset of items + cursor on switch. Comments keep their fixed sort.

## How it works

- Sort mappings: Hot → `ranking desc`; New → `createdAt desc` (the `pgTable` wrapper's metadata columns already include it); Top → `noLikes desc`.
- Cursor pagination already supports compound sort keys, so add a unique tiebreaker (`id`) as the second key, matching the existing default's behavior.
- Store: switching sort clears `items` and refetches page one; the waypoint continues from the new cursor.

## Key files

Paths relative to `packages/app`.

| File                                   | Change                       |
| -------------------------------------- | ---------------------------- |
| `app/pages/index.vue`                  | sort toggle                  |
| `app/store/post/index.ts`              | sort state + reset-on-switch |
| `app/composables/post/useReadPosts.ts` | thread `sortBy`              |

## Notes

- No schema or server change — the procedure and cursor helpers already support every mapping.
- Top is all-time (no time windows) — casual scale doesn't need "top this week" partitioning yet; revisit if the feed ages badly.
