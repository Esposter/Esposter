---
title: Room settings
description: The fullscreen room settings dialog — Discord Server Settings categories, panels, and per-panel permission gating.
---

# Room Settings

A Discord-style fullscreen settings dialog for a room, opened from the cog on its row in the room list — including a room the reader is not in, without going there. The panels read the same keyed store slices the room list and the message list do, so those slices follow `useRoomStore.scopedRoomId`: the route's room, or the room settings is open over. Reading the route's room instead is what made the cog navigate first, and the navigation was visible as a flicker behind the dialog. Its information architecture matches Discord Server Settings: a two-level sidebar of category groups (`v-list-group`) whose items are the panels, with the first category headed by the room name itself and **Delete** kept as a standalone destructive item below the categories.

## Categories and panels

`SettingsCategoryMap` owns the grouping; every `SettingsType` except `Delete` belongs to exactly one category (enforced by the map's co-located test).

| Category                 | Panels                                       | Gated panels (permission)                                                 |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| _(room name)_            | Overview · Roles · Profile · Emojis          | Overview (`ManageRoom`), Roles (`ManageRoles`), Emojis (`ManageEmojis`)   |
| Integrations             | Webhooks                                     | Webhooks (`ManageWebhooks`)                                               |
| Moderation               | Word Filter · Audit Log · Bans · Attachments | Word Filter + Audit Log + Attachments (`ManageRoom`), Bans (`BanMembers`) |
| User Management          | Members · Invites                            | Members (`ManageRoles`)                                                   |
| _(below the categories)_ | Delete · Leave                               | the owner deletes, every other member leaves                              |

The destructive row is the one whose label follows the reader rather than the panel: `Delete` for the owner, `Leave` for everyone else, over the same `StyledDeleteFormDialog` — the room-name confirmation guard is the owner's only, since leaving is not irreversible ([destructive confirmation](/docs/architecture/destructive-confirmation)).

Gating lives in `SettingsPermissionMap` — a panel with an entry is hidden from members lacking that `RoomPermission`; a category with no visible panels disappears entirely. Room owners bypass all checks via `checkHasPermission`. Every panel except **Profile** and **Invites** carries an entry, because every write behind it is guarded by the same permission server-side: an ungated row is a rail entry whose every control rejects, and the Webhooks panel's own read rejects before it draws anything. Profile edits the reader's own membership and Invites shows the reader's own link, which every member may do.

`MANAGEMENT_PERMISSIONS` — the gate on opening the dialog at all, and on the room list's settings button — is the union of that map plus `Administrator`, derived from it rather than listed beside it. A member who may only manage emoji or bans therefore reaches the rail that manages them, holding one row.

**Roles** edits roles and their permission bitfields; **Members** assigns/revokes member roles and searches the room by name, over the `readMembers` predicate the room list has always accepted — the room's own totals are read once and never re-read against a filtered page, since the roleless group is derived from a count of everybody; **Invites** lists the link the reader holds and links into the dialog that creates one, which is where creating stays ([invites](/docs/esbabbler/invites)); **Attachments** edits the room's upload limits, described in [file & media](/docs/esbabbler/file-media).

## How it works

```mermaid
flowchart LR
  Dialog["Settings/Dialog.vue<br/>(singleton, settingsRoomId)"] --> LeftSideBar["LeftSideBar.vue<br/>v-list-group per SettingsCategory"]
  Dialog --> Content["Content.vue<br/>Suspense + skeleton"]
  LeftSideBar -- "select SettingsType (closes drawer on mobile)" --> Content
  Content -- "SettingsContentMap[settingsType]" --> Panel["Type/*/Index.vue<br/>lazy async panel"]
  Content -- "mobile hamburger — open v-model" --> LeftSideBar
  LeftSideBar -- "SettingsPermissionMap gate" --> RBAC["useRoleStore.getMyPermissions"]
```

The dialog mirrors the [user settings dialog](/docs/esbabbler/settings) conventions: panels are lazy `defineAsyncComponent`s rendered in `<Suspense :timeout="0">` with the shared `MessageModelSettingsSkeleton` fallback, and the active panel item in the open category group is highlighted by the generic `StyledSlideIndicator` rail (items carry `data-slide-indicator-key`). Unlike the user dialog there is no in-panel section scrollspy — room panels are single-view tools (tables and two-pane editors), so the second nav level selects panels, not scroll sections.

## Saving a panel

Every panel that edits the room row saves through `useSaveRoom`, not through its own `executeMutation` call. The panel holds its controls as its own refs — deliberately not a clone of the row, so a rejected save leaves what the user entered standing with `isDirty` still true and the next blur retries it ([client data access](/docs/architecture/client-data)) — and hands `useSaveRoom` only the fields it owns. The composable adds the room id, keys the write on it so panels editing different fields of one room queue instead of clobbering each other, and builds the rollback by reading back **exactly the keys the save wrote**. Snapshotting the whole row instead would revert a field another client changed between the apply and the rejection.

Two panels writing disjoint fields is therefore the normal case rather than a special one, and adding a third is a call with a different field set — never another copy of the optimistic block.

## Mobile

The shared `MessageModelSettingsLeftSideBar` drawer is `permanent` only on desktop; on `smAndDown` (`useVDisplay`) it becomes a `temporary` overlay drawer, closed by default and opened by a `mdi-menu` hamburger the content header renders on mobile. Selecting any panel closes the drawer so the content takes the full width — the room dialog threads this open-state through the `Dialog` (`open` v-model on the sidebar, `open:drawer` emit from the content), and the [user settings dialog](/docs/esbabbler/settings) does the same via `isDrawerOpen` on its dialog store. The two-pane panels that would otherwise sit side by side — Roles and Members (list column + editor column) — stack to a single column under the `sm` breakpoint (`cols="12" sm="4"` on the list column) so neither pane is squeezed.

## Key files

| File                                                                  | Role                                                  |
| :-------------------------------------------------------------------- | :---------------------------------------------------- |
| `packages/app/app/models/message/room/SettingsType.ts`                | panel enum (values double as titles)                  |
| `packages/app/app/models/message/room/SettingsCategory.ts`            | sidebar category enum                                 |
| `packages/app/app/services/message/settings/SettingsCategoryMap.ts`   | category → panels grouping                            |
| `packages/app/app/services/message/settings/SettingsListItemMap.ts`   | panel icons/colors                                    |
| `packages/app/app/services/message/settings/SettingsContentMap.ts`    | panel → lazy component                                |
| `packages/app/app/services/message/settings/SettingsPermissionMap.ts` | panel → required `RoomPermission`                     |
| `packages/app/app/composables/message/room/useSaveRoom.ts`            | shared optimistic room-row save + key-scoped rollback |
| `packages/app/app/components/Message/Model/Room/Settings/`            | dialog + sidebar + `Type/*` panels                    |
| `packages/app/app/services/room/rbac/constants.ts`                    | the dialog's own gate, derived from the panel map     |
