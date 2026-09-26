---
title: Room UI
description: Room-shell polish — role-grouped member list, resizable sidebars, message density, empty states, one room header at every width, category drag-reorder.
---

# Room UI

One cohesive polish pass over the room shell, matching Discord's refinements. Visual preferences (sidebar widths, message density) are device-local `localStorage`, per the [settings](/docs/esbabbler/settings) persistence rule; the one exception is category ordering, which is server-persisted through a dedicated `reorderRoomCategories` procedure.

## Role-grouped member list

The member sidebar groups members Discord-style: one group per top hoisted role ordered by role position (highest first), with roleless members trailing in a single "Members" group. A member's display name is tinted with their top role's color; the implicit `@everyone` role never groups or tints. Grouping and top-role resolution are pure services (`getMemberGroups`, `getTopRole`) with co-located tests.

### Group counts

Each group subheader shows the group's **total** member count, not the loaded-page count — the list is cursor-paginated, so counting loaded members would silently undercount. Totals stay correct through three mechanisms, each owning a different change source:

```mermaid
flowchart TD
  readMembers["useReadMembers.readMembers<br/>(room switch)"] -- "readMemberCountsByTopRole query" --> counts["memberStore.memberCountsByTopRole<br/>(per-role totals)"]
  joinLeave["member join/leave<br/>(subscriptions)"] -- "count++ / count--" --> total["memberStore.count"]
  joinLeave -- "leave clears the member's roles" --> roleMutation
  total -- "roleless = count - sum(role groups)" --> headers["group subheader counts"]
  counts --> headers
  roleMutation["role assign/revoke/delete<br/>(optimistic, rollback, subscription)"] -- "mutateMemberRoles diffs top role" --> hooks["topRoleChangeHooks"]
  hooks -- "+-1 on the affected role groups" --> counts
```

- **Room switch** — `readMembers` fetches `room.readMemberCountsByTopRole` (one `DISTINCT ON` query grouping members by their highest-positioned non-`@everyone` role) alongside the member page and total count.
- **Join/leave** — the roleless group is never fetched; it is derived as `count - sum(role groups)`. A join is roleless by definition, so the subscription's `count++` alone keeps it current. A leave is expressed as the member's top role becoming none — `storeDeleteMember` routes through `mutateMemberRoles` before decrementing `count`, so the role group the leaver belonged to drops with the total. Without that, the roleless remainder absorbs every departure of a roled member and goes negative in a room where everyone holds a role.
- **Role changes** — every role-membership mutation (optimistic apply, rollback, `onSuccess`, and the role subscription handlers) funnels through the role store's `mutateMemberRoles`, which diffs the member's top role and fires `topRoleChangeHooks`; the member store registers a hook that shifts the affected role-group counts. Reads (`readMemberRoles`) bypass the hooks — server counts already include loaded members.

## Resizable, persisted sidebars

The left (rooms) sidebar and right (members/search/thread) drawer have a drag handle on their inner edge. Widths clamp between the min and max sidebar constants, persist per device in `localStorage` via the message layout store, and feed both the layout's drawer width and the fixed-layout offset styles so the chat content reflows while dragging. Handles render on desktop only — drawers float over content on mobile.

## Message display density

User Settings → Appearance → Message Display offers Discord's Cozy/Compact choice. Compact halves the gap between message batches and the per-message vertical padding so more messages fit on screen. The mode is device-visual state in the appearance store (`localStorage`), consistent with the theme staying on the cookie rather than in `userSettingsInMessage`.

## Empty states

The library's `UiEmptyState` (a mark named by its meaning, a title, a line on how that changes) backs every placeholder: the room list shows "No rooms yet" with a create/join hint when the user has no rooms, message search shows "No results" with a hint to change the keywords or filters when a query matches nothing, and the Drafts & Sent lists say what waits in them once something does.

## One room header at every width

The room header is the same component on a phone and on a desktop, and there is no second bar of buttons above the composer. It holds the room-list toggle while the rooms are not docked, the room's name (the topic beside it from `sm` up), and at its end the call, the search and member-list toggles, and the room's overflow menu. The overflow menu holds what is read now and then — the followed threads and the pinned messages, each opening its pane in the side panel — and the notification level as a group of radios, marked with the level the reader has. Pinned messages are a pane rather than a popover off the header, as Slack's are, so a phone reads them in the same sheet as the members.

```mermaid
flowchart LR
  header["MessageContentHeader — every width"]
  header --> rooms["Rooms toggle<br/>(only while the rooms are not docked)"]
  header --> name["Name, topic from sm up<br/>(the creator edits from it)"]
  header --> call["Call"]
  header --> search["Search toggle"] --> panel["Side panel pane"]
  header --> members["Member list toggle"] --> panel
  header --> overflow["Room actions menu"]
  overflow --> threads["Followed Threads"] --> panel
  overflow --> pinned["Pinned Messages"] --> panel
  overflow --> level["Notification level — radios"]
```

Discord keeps a bell of its own in the header; folding it into the menu is the one mark fewer that lets the header fit a phone. The rule the header follows — one presentation per surface, promoted to a device-specific one only by the test in [Responsive layout](/docs/architecture/responsive) — is the architecture page's.

## Category drag-reorder

Room categories in the left sidebar reorder by dragging their headers (SortableJS via `vue-draggable-plus`); a ghost placeholder with a primary-colored top border marks the drop target. Touch drags wait `ROOM_CATEGORY_TOUCH_DRAG_DELAY_MS` (`delayOnTouchOnly`) so a swipe that starts on a header scrolls the list instead of reordering it. Alt+↑/Alt+↓ on a focused category header moves it without a pointer. The store applies the new positions optimistically (via [`useMutation`](/docs/architecture/client-data)), then persists only the rows whose position changed (`getRoomCategoryPositionUpdates`) through the `reorderRoomCategories` procedure — a single DB transaction, so a drag either fully lands or fully rolls back. `readRoomCategories` orders by `position` first with `name` as tiebreaker, and `createRoomCategory` appends below the existing order (`max(position) + 1`) so a new category never jumps above a drag-assigned top.

## Key files

| File                                                                           | Role                                                          |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `apps/web/app/services/message/member/getMemberGroups.ts`                      | Discord-style member grouping by top role                     |
| `apps/web/app/services/message/member/getTopRole.ts`                           | Top hoisted role for grouping + name tint                     |
| `apps/web/app/services/message/member/topRoleChangeHooks.ts`                   | Role store → member store count-sync hooks                    |
| `apps/web/shared/models/db/room/MemberCountByTopRole.ts`                       | Per-top-role count row from the server                        |
| `apps/web/app/store/message/ui/layout.ts`                                      | Persisted sidebar widths + right drawer selection             |
| `apps/web/app/components/Ui/ResizeHandle.vue`                                  | A sidebar's edge, dragged or stepped by the arrows to size it |
| `apps/web/app/store/message/ui/appearance.ts`                                  | Persisted message display density                             |
| `apps/web/app/components/Message/Model/User/Settings/Type/Appearance/`         | Appearance settings panel (Message Display)                   |
| `apps/web/app/components/Ui/EmptyState.vue`                                    | The library's mark/title/description empty state              |
| `apps/web/app/components/Message/Content/Header/Index.vue`                     | The one room header, at every width                           |
| `apps/web/app/components/Message/Content/Header/OverflowMenu.vue`              | The room's occasional panes and its notification level        |
| `apps/web/app/services/message/roomCategory/getRoomCategoryPositionUpdates.ts` | Position diff for category reorder persistence                |

## Notes

- Member-list search does not exist yet, so it has no empty state — if a search field lands it should reuse `UiEmptyState`.
- Room drag-reorder (rooms within/between categories) is out of scope — only categories reorder.
