# Room UI

The room shell's polish, matching Discord's refinements. Visual preferences (sidebar widths, message density) are device-local `localStorage`, per the [settings](../settings/design.md) persistence rule; the one exception is the categories, which are each member's own: their order is server-persisted through a dedicated `reorderRoomCategories` procedure, and each room's place among them is the member's own `categoryId` ([room category assignment](#room-category-assignment)).

## Role-grouped member list

The member sidebar groups members Discord-style: one group per top hoisted role ordered by role position (highest first), with roleless members trailing in a single "Members" group. A member's display name is tinted with their top role's color; the implicit `@everyone` role never groups or tints. Grouping and top-role resolution are pure services (`getMemberGroups`, `getTopRole`). The rows are built by `getMemberListItems` from those groups, which takes each heading, count and description rule from its own pure service. The list and the description have co-located tests; the heading and the roleless count are tested through the list.

### Group counts

Each group subheader shows the group's **total** member count, not the loaded-page count — the list is cursor-paginated, so counting loaded members would silently undercount. Totals stay correct through three mechanisms, each owning a different change source:

```mermaid
flowchart TD
  readMembers["useReadMembers.readMembers<br/>(room switch)"] -- "refreshMemberCounts" --> counts["memberStore totals<br/>(count, per-role groups)"]
  joinLeave["member join/leave<br/>(subscriptions)"] -- "refreshMemberCounts" --> counts
  roleRefresh["room list re-reads its rooms' roles<br/>(a topic change re-runs the first page)"] -- "a refresh of roles already held fires memberRoleChangeHooks" --> counts
  counts -- "roleless = count - sum(role groups)" --> headers["group subheader counts"]
```

- **Room switch** — `readMembers` re-reads the totals through `refreshMemberCounts`: the total from `room.readMembersCount` and the per-role groups from `room.readMemberCountsByTopRole` (one `DISTINCT ON` query grouping members by their highest-positioned non-`@everyone` role), served by `usersToRoomRoles_roomId_userId_index`, and the member total by `usersToRooms_roomId_index`; the primary key of each table leads with the user, so each room-wide read is served by its own index, ordered with every other re-read of the room. Offline, no total is shown: the members cache keeps no record of whether its rows are the whole list, so the cached rows are not a total, and the header and the roleless group are titled by name alone until a read answers the total.
- **Join/leave** — the totals are never adjusted by a delta: a join or a leave re-reads them, since the server has committed the change before its event is sent. The roleless group is never fetched; it is derived as `count - sum(role groups)` from the two re-read numbers. A leave also fires the hook: `arriveLeftMember` arrives the membership's tombstone and then calls `notifyMemberRoleChange`, which re-reads the totals. Without the re-read the roleless remainder absorbs every departure of a roled member and goes negative in a room where everyone holds a role.
- **Role changes** — a role-membership write does not fire the hooks itself: its answer arrives the assignment or its tombstone, and nothing more. The totals reach a role change through the re-read of the room's roles. The room list's first-page read re-runs when its topics change and re-reads the roles of the rooms it shows, and a re-read of roles the store already holds fires `memberRoleChangeHooks`, so the member store re-reads the room's totals for each. The re-read is used rather than a delta because the group a change leaves is not always known here: a member whose roles were never read has no prior role at all.
- **Ordering** — the re-read rule and its latest-started-wins order are owned by the [client data](../../architecture/client-data/design.md) page ("Server-owned aggregates are re-read, never adjusted"). This page holds only the room's use of it.

#### A failed re-read and the snapshot race

Each room's re-read is one pair: the total and the per-role groups are read together and written only once both return, so a failed read leaves the last settled pair standing. A total is never written beside groups from another read, which keeps the roleless remainder from going negative on a mixed pair.

On failure the batched refresh puts the room back as dirty and retries with exponential backoff, up to the number of retries in a row that `MAX_RETRIES` declares in `apps/web/app/services/shared/createBatchedRefresh.ts`. After that the room waits for the next change to mark it, and that change's re-read is the retry. Until a read settles, the counts show the pre-change pair.

Options rejected for a failed read:

- **Reset the room's totals to zero.** Every group heading would read 0 beside the members listed under it, and the roleless group would show the whole room. The reset shows a count the room does not have, with nothing marking it as unknown.
- **Reset the totals from a fresh read.** A failed read has no value to reset to, and a read that later succeeds is only the retry. A reset to a read the store has not seen settle can drop a change the settled pair already counted, and no event brings that change back.
- **Retry without a bound.** A server that stays down would be read forever. The retry bound and the next change bound it.

The snapshot race is the case where a role change for a loaded member is committed before a re-read of the totals, but the rows it changes are published after that re-read has answered, so the change looks counted twice. A double count needs a delta, and no delta is ever applied to these totals ([client data](../../architecture/client-data/design.md)): the re-read its publish wakes reads state at or after the commit, so the change is counted once. A change another member made reaches the totals this way: the room list's first-page read re-runs when its topics change, re-reads the roles of its rooms, and that re-read fires the member-role hooks that re-read the totals. What remains is a window. While a re-read is in flight, the counts show the last settled read, and they are exact once the latest re-read settles, because the read ordering in [client data](../../architecture/client-data/design.md) makes that read reflect every change the client has been told of.

Closing that window by numbering the server's member events, so a delta and a snapshot could be ordered, was rejected for size. It needs a server sequence on every join and leave and on every role publish, a protocol change on each subscription that carries them, and an ordering across the subscriptions that feed the counts. That is more change than the window costs.

## Resizable, persisted sidebars

The left (rooms) sidebar and right (members/search/thread) drawer have a drag handle on their inner edge. Widths clamp between the min and max sidebar constants, persist per device in `localStorage` via the message layout store, and feed both the layout's drawer width and the fixed-layout offset styles so the chat content reflows while dragging. Handles render on desktop only — drawers float over content on mobile.

## Message display density

User Settings → Appearance → Message Display offers Discord's Cozy/Compact choice. Compact halves the gap between message batches and the per-message vertical padding so more messages fit on screen. The mode is device-visual state in the appearance store (`localStorage`), consistent with the theme staying on the cookie rather than in `userSettingsInMessage`.

## Empty states

The library's `UiEmptyState` (a mark named by its meaning, a title, a line on how that changes) backs every placeholder: the room list shows "No rooms yet" with a create/join hint when the user has no rooms, message search shows "No results" with a hint to change the keywords or filters when a query matches nothing, and the Drafts & Sent lists say what waits in them once something does.

## One room header at every width

The room header is the same component on a phone and on a desktop, and there is no second bar of buttons above the composer. It holds the room-list toggle while the rooms are not docked, the room's name (the topic beside it from `sm` up), and at its end the room's overflow menu. From `sm` up, the call and the pane toggles — followed threads, search, members — sit out beside the menu; on a phone they lead the menu as rows, the toggles checked while their pane is open, so a phone's header holds the room-list toggle, the name and the menu. Both sides read `smAndUp` from `useUiDisplay`, so the header and its menu agree on which commands are out at every width; the fold is not the cut where the rooms dock (`lg`), since a desktop window narrower than that still fits every mark. The overflow menu holds what is read now and then — the pinned messages, opening their pane in the side panel — and the notification level as a group of radios, marked with the level the reader has. Pinned messages are a pane rather than a popover off the header, as Slack's are, so a phone reads them in the same sheet as the members.

```mermaid
flowchart LR
  header["MessageContentHeader<br/>every width"]
  header --> rooms["Rooms toggle<br/>(only while the rooms are not docked)"]
  header --> name["Name, topic from sm up<br/>(the creator edits from it)"]
  header --> call["Call<br/>(out from sm up, a menu row on a phone)"]
  header --> threads["Followed threads toggle<br/>(out from sm up, a checked row on a phone)"] --> panel["Side panel pane"]
  header --> search["Search toggle<br/>(out from sm up, a checked row on a phone)"] --> panel
  header --> members["Member list toggle<br/>(out from sm up, a checked row on a phone)"] --> panel
  header --> overflow["Room actions menu"]
  overflow --> pinned["Pinned Messages"] --> panel
  overflow --> level["Notification level<br/>radios"]
```

Discord keeps a bell of its own in the header; folding it into the menu is the one mark fewer that lets the header fit a phone. The rule the header follows — one presentation per surface, promoted to a device-specific one only by the test in [Responsive layout](../../architecture/responsive/design.md) — is the architecture page's.

## Category drag-reorder

Room categories in the left sidebar reorder by dragging their headers by the UI library's `REORDER_HANDLE_CLASS`, through its [drag reorder](../../architecture/drag-reorder/design.md); the held category wears the library's global `reorder-ghost`, lifted over the others while they move aside for it, as in every reorderable list and table. Touch drags wait the UI library's `TOUCH_DRAG_DELAY_MS`, as a reorderable list's do, so a swipe that starts on a header scrolls the list instead of reordering it. Alt+↑/Alt+↓ on a focused category header moves it without a pointer, through the same `getMovedItems` a reorderable list's keys use. The store draws the new positions at once through the overlay (the reorder entry, `getReorderRoomCategoriesEntry`), then persists only the rows whose position changed (`getRoomCategoryPositionUpdates`) through the `reorderRoomCategories` procedure. That procedure is one statement, which moves nothing unless every category it names is the caller's live one, so a refused drag leaves the previous order, which the overlay shows again once the entry drops. `readRoomCategories` orders by `position` first with `name` as tiebreaker, and `createRoomCategory` appends below the existing order: the server computes the new position inside its insert statement, so a new category never jumps above a drag-assigned top, and two creates at once get distinct positions. The order is the caller's own: `reorderRoomCategories` writes only categories the caller owns, so a drag never reorders another member's sidebar.

## Room category assignment

A room's category is the member's own. Each member's `usersToRooms` row carries the `categoryId` of one of their own categories. `updateUserToRoom` writes it for the caller only and refuses a category the caller does not own (`ownedBy`, since the foreign key proves only that the category exists), and a category's deletion sets its owner's memberships' category to null, since the category is kept as a tombstone. The sidebar groups each room under the reader's own row through `resolveRoomCategoryId`, which lists a room whose category the reader no longer has as uncategorized rather than dropping it. The room-wide `categoryId` this replaced hid a room from every member but the one who set it, and let a second manager overwrite the first.

The category is set from the Category field in the room settings' Overview panel. That panel is shown to holders of `ManageRoom` only ([room settings](../room-settings/design.md)), so a member without the permission has no field to file a room with. The gating is not changed here.

## Key files

| File                                                                           | Role                                                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `apps/web/app/services/message/member/getMemberGroups.ts`                      | Discord-style member grouping by top role                                                            |
| `apps/web/app/services/message/member/getMemberListItems.ts`                   | The member list's rows, each under its group's heading                                               |
| `apps/web/app/services/message/member/getMemberGroupTitle.ts`                  | A group's heading: its role's name and how many hold it                                              |
| `apps/web/app/services/message/member/getRolelessMemberCount.ts`               | The roleless group's count: the total less the role groups                                           |
| `apps/web/app/services/message/member/getMemberDescription.ts`                 | A row's account name, when the room shows another, and status                                        |
| `apps/web/app/services/message/member/getTopRole.ts`                           | Top hoisted role for grouping + name tint                                                            |
| `apps/web/app/services/message/member/memberRoleChangeHooks.ts`                | Role store → member store totals re-read hook                                                        |
| `apps/web/shared/models/db/room/MemberCountByTopRole.ts`                       | Per-top-role count row from the server                                                               |
| `apps/web/app/store/message/ui/layout.ts`                                      | Persisted sidebar widths + right drawer selection                                                    |
| `apps/web/app/components/Ui/ResizeHandle.vue`                                  | A sidebar's edge, dragged or stepped by the arrows to size it                                        |
| `apps/web/app/store/message/ui/appearance.ts`                                  | Persisted message display density                                                                    |
| `apps/web/app/components/Message/Model/User/Settings/Type/Appearance/`         | Appearance settings panel (Message Display)                                                          |
| `apps/web/app/components/Ui/EmptyState.vue`                                    | The library's mark/title/description empty state                                                     |
| `apps/web/app/components/Message/Content/Header/Index.vue`                     | The one room header, at every width                                                                  |
| `apps/web/app/components/Message/Content/Header/OverflowMenu.vue`              | The room's occasional panes and its notification level, and on a phone the header's call and toggles |
| `apps/web/app/services/message/roomCategory/getRoomCategoryPositionUpdates.ts` | Position diff for category reorder persistence                                                       |
| `apps/web/app/services/message/roomCategory/resolveRoomCategoryId.ts`          | The category a room is listed under, resolved against the reader's own categories                    |
| `apps/web/app/components/Message/LeftSideBar/Rooms.vue`                        | The sidebar's room groups, each room under the reader's own category                                 |
| `apps/web/app/components/Message/Model/Room/Settings/Type/Overview/Index.vue`  | The Category field, saved on the reader's own membership                                             |
| `apps/web/server/services/message/updateUserToRoom.ts`                         | Writes a member's own row, refusing a category the caller does not own                               |

## Notes

- Room drag-reorder (rooms within/between categories) is out of scope — only categories reorder.
