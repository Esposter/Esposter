# Esbabbler — User Settings Surface

A Discord-style fullscreen user-settings surface, built by reusing the room-settings machinery. Prerequisite for several backlog items (push-to-talk, per-user volume default, auto-idle) that currently have no home.

## Overview

The user-settings dialog is a skeleton: `MessageLeftSideBar/Settings/DialogButton.vue` mounts `Message/Model/Settings/{LeftSideBar,Content,RightSideBar}.vue`, but the sidebar renders no category list and the content is an empty slot. A second, unrelated surface — `pages/user/settings.vue` → "General" → `UserProfileCard` — holds the only real settings today.

This builds the dialog out as the single canonical surface, mirroring the proven room-settings pattern (`SettingsType` enum → `SettingsListItemMap` → `SettingsContentMap` → `Type/*` panels). The standalone page collapses into the **Profile** panel so there is one source of truth.

The surface is mostly **client-local**: most panels persist to `localStorage` via a Pinia store, so the foundation needs **no migration**. Only Profile, presence status, and per-room notification preference are server-backed — and all three already exist.

## Categories

Discord's User Settings, scoped to shipped features. Names are Discord-standard and chosen to be stable (renaming after panels exist is the expensive part).

| Panel             | Holds                                                                                              | Persistence                                                                                | Reuses                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **My Account**    | email / account identity                                                                           | server (`users`, read-only display)                                                        | auth session                                                                      |
| **Profile**       | biography + avatar                                                                                 | server (existing profile edit + SAS upload)                                                | `UserProfileCard`, profile-edit form — relocated from `pages/user/settings.vue`   |
| **Voice & Video** | push-to-talk, input/output device, input sensitivity, default mute/deafen, per-user volume default | client (`localStorage`)                                                                    | call store / LiveKit — see [voice-video-settings.md](voice-video-settings.md)     |
| **Notifications** | default notification type, presence status + custom status, auto-idle threshold                    | mixed — status + per-room type are server (already shipped), auto-idle threshold is client | `NotificationSettingsMenuButton`, `userStatuses`, `usersToRooms.notificationType` |
| **Appearance**    | theme mode                                                                                         | client (`localStorage`, SSR-safe cookie)                                                   | existing Vuetify theme                                                            |
| **Keybinds**      | Ctrl+K palette + call keybinds                                                                     | client (`localStorage`)                                                                    | command palette                                                                   |

No permission gating — every panel is self-scoped to the current user (unlike room settings, which gate via `SettingsPermissionMap`).

## Data Model Changes

None for the foundation. All new state is client-local; existing server-backed state (`users` bio/avatar, `userStatuses`, `usersToRooms.notificationType`) is unchanged. Cross-device sync of client prefs is explicitly deferred — see [../deferred/user-settings-sync.md](../deferred/user-settings-sync.md).

## Components

Mirror the room-settings file layout one folder over, under `Message/Model/Settings/`:

- `Message/Model/Settings/LeftSideBar.vue` — **wire up** (currently an empty drawer slot): render a `LeftSideBarItem` per `UserSettingsListItemMap` entry, `v-model` the active type. No permission filter.
- `Message/Model/Settings/LeftSideBarItem.vue` — new; copy of the room-settings item (icon + title + active state).
- `Message/Model/Settings/Content.vue` — **wire up**: `<component :is="UserSettingsContentMap[settingsType]">` inside the existing container shell.
- `Message/Model/Settings/Type/Account/Index.vue` — email / account identity (read-only).
- `Message/Model/Settings/Type/Profile/Index.vue` — biography + avatar; hosts the relocated `UserProfileCard` edit form.
- `Message/Model/Settings/Type/Voice/Index.vue` — Voice & Video panel — see [voice-video-settings.md](voice-video-settings.md).
- `Message/Model/Settings/Type/Notifications/Index.vue` — default notification type + presence status + auto-idle threshold.
- `Message/Model/Settings/Type/Appearance/Index.vue` — theme mode picker.
- `Message/Model/Settings/Type/Keybinds/Index.vue` — keybind list + capture.

## Key Files

| File                                                           | Role                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/models/user/UserSettingsType.ts`                          | enum; string values double as panel titles (mirror `models/message/room/SettingsType.ts`, `sort-enums` disabled to keep order)                               |
| `app/services/user/settings/UserSettingsListItemMap.ts`        | `Record<UserSettingsType, { icon; color? }>` for the sidebar                                                                                                 |
| `app/services/user/settings/UserSettingsContentMap.ts`         | `Record<UserSettingsType, Component>` via `defineAsyncComponent`, lazy-loading each `Type/*/Index.vue`                                                       |
| `app/store/user/settings/index.ts`                             | client prefs Pinia store (appearance, keybinds, auto-idle threshold) backed by `localStorage`; SSR-guard with `getIsServer()` (mirror `store/message/input`) |
| `app/store/user/settings/voice.ts`                             | Voice & Video client prefs, consumed by the call store — see [voice-video-settings.md](voice-video-settings.md)                                              |
| `app/components/Message/LeftSideBar/Settings/DialogButton.vue` | existing shell; no change beyond the three wired children                                                                                                    |
| `app/pages/user/settings.vue`                                  | collapse into the Profile panel; keep the `RoutePath.UserSettings` route as a deep-link that opens the dialog (or redirects)                                 |

## Constraints / Notes

- **Single surface.** The fullscreen dialog is canonical; the standalone page is folded into the Profile panel to avoid two divergent profile editors.
- **No new table.** Client prefs live in `localStorage` behind a Pinia store. This keeps the foundation migration-free and matches Discord's per-device handling of device/audio/appearance settings.
- **Pattern fidelity over novelty.** Copy the room-settings enum/map/panel structure verbatim so the two surfaces stay learnable as one idiom; the only intentional divergence is dropping the permission map.
- **Server-backed panels already exist** — Profile, Notifications (per-room type + presence) wire to shipped procedures; this spec only relocates their UI into the new surface, it does not re-implement them.
- Cross-device sync of client prefs → [../deferred/user-settings-sync.md](../deferred/user-settings-sync.md).
