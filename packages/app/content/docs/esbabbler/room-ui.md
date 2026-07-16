---
title: Room UI
description: Room-shell polish — role-grouped member list, resizable sidebars, message density, empty states, mobile action bar, category drag-reorder.
---

# Room UI

One cohesive polish pass over the room shell, matching Discord's refinements. Visual preferences (sidebar widths, message density) are device-local `localStorage`, per the [settings](/docs/esbabbler/settings) persistence rule; the one exception is category ordering, which is server-persisted through a dedicated `reorderRoomCategories` procedure.

## Role-grouped member list

The member sidebar groups members Discord-style: one group per top hoisted role ordered by role position (highest first), with roleless members trailing in a single "Members" group. Each group renders a subheader with the role name and member count. A member's display name is tinted with their top role's color; the implicit `@everyone` role never groups or tints. Grouping and top-role resolution are pure services (`getMemberGroups`, `getTopRole`) with co-located tests.

## Resizable, persisted sidebars

The left (rooms) sidebar and right (members/search/thread) drawer have a drag handle on their inner edge. Widths clamp between the min and max sidebar constants, persist per device in `localStorage` via the message layout store, and feed both the Vuetify drawer width and the fixed-layout offset styles so the chat content reflows while dragging. Handles render on desktop only — drawers float over content on mobile.

## Message display density

User Settings → Appearance → Message Display offers Discord's Cozy/Compact choice. Compact halves the gap between message batches and the per-message vertical padding so more messages fit on screen. The mode is device-visual state in the appearance store (`localStorage`), consistent with the theme staying on the cookie rather than in `userSettingsInMessage`.

## Empty states

The generic `StyledEmptyState` (icon + title + description) backs welcome-style placeholders: the room list shows "No rooms yet" with a create/join hint when the user has no rooms, and message search shows "No results" with a retry hint when a query matches nothing. The Drafts & Sent view keeps its own full-height empty states.

## Mobile action bar

On `smAndDown` a bottom action bar sits above the composer, keeping room actions within thumb reach: room-list toggle, pinned messages, add friends, member-list toggle, and search. It reuses the same header action-button components, complementing the header's `⋮` overflow collapse.

## Category drag-reorder

Room categories in the left sidebar reorder by dragging their headers (SortableJS via `vue-draggable-plus`); a ghost placeholder with a primary-colored top border marks the drop target. Alt+↑/Alt+↓ on a focused category header moves it without a pointer. The store applies the new positions optimistically (via [`useMutation`](/docs/architecture/client-data)), then persists only the rows whose position changed (`getCategoryPositionUpdates`) through the `reorderRoomCategories` procedure — a single DB transaction, so a drag either fully lands or fully rolls back. `readRoomCategories` orders by `position` first with `name` as tiebreaker.

## Key files

| File                                                                           | Role                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------- |
| `packages/app/app/services/message/member/getMemberGroups.ts`                  | Discord-style member grouping by top role         |
| `packages/app/app/services/message/member/getTopRole.ts`                       | Top hoisted role for grouping + name tint         |
| `packages/app/app/store/message/ui/layout.ts`                                  | Persisted sidebar widths + right drawer selection |
| `packages/app/app/components/Styled/ResizeHandle.vue`                          | Generic pointer-drag width handle                 |
| `packages/app/app/store/message/ui/appearance.ts`                              | Persisted message display density                 |
| `packages/app/app/components/Message/Model/User/Settings/Type/Appearance/`     | Appearance settings panel (Message Display)       |
| `packages/app/app/components/Styled/EmptyState.vue`                            | Generic icon/title/description empty state        |
| `packages/app/app/components/Message/Content/MobileActionBar.vue`              | Bottom action bar on small screens                |
| `packages/app/app/services/message/roomCategory/getCategoryPositionUpdates.ts` | Position diff for category reorder persistence    |

## Notes

- Member-list search does not exist yet, so it has no empty state — if a search field lands it should reuse `StyledEmptyState`.
- Room drag-reorder (rooms within/between categories) is out of scope — only categories reorder.
