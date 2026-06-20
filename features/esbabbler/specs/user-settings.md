# Esbabbler — User Settings Surface

A Discord-style fullscreen user-settings surface, built by reusing the room-settings machinery. Prerequisite for several backlog items (push-to-talk, per-user volume default, auto-idle) that hang off it.

## Overview

The user-settings dialog was a skeleton: `MessageLeftSideBar/Settings/DialogButton.vue` mounts shared shells (`Message/Model/Settings/{LeftSideBar,Content,RightSideBar}.vue`), but the sidebar rendered no category list and the content was an empty slot. A second, unrelated surface — `pages/user/settings.vue` → "General" → `UserProfileCard` — held the only real settings.

This builds the dialog out as the canonical surface, mirroring the room-settings pattern (`SettingsType` enum → list-item map → content map → `Type/*` panels). Because the shared shells are already wrapped by room-settings, the user surface gets its **own** parallel wrappers under `Message/Model/User/Settings/` (exactly mirroring `Message/Model/Room/Settings/`) rather than filling the shared shells.

Global prefs are **DB-backed** via a new `userSettings` table (1:1 on `userId`, mirroring `userStatuses`) so they sync across devices. Only genuinely per-device state stays in `localStorage`: hardware device IDs (mic/speaker/camera) and UI collapsibles.

## Categories

Discord's User Settings, scoped to shipped features. Names are Discord-standard and chosen to be stable.

| Panel             | Holds                                                                     | Persistence                                                                                                      |
| ----------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **My Account**    | email / account identity                                                  | server (`users`, read-only display)                                                                              |
| **Profile**       | biography + avatar                                                        | server (`users`, via existing `UserProfileCard` + SAS upload)                                                    |
| **Voice & Video** | input mode, PTT keybind, sensitivity, default mute/deafen, default volume | server (`userSettings`); device IDs stay `localStorage` — see [voice-video-settings.md](voice-video-settings.md) |
| **Notifications** | auto-idle threshold                                                       | server (`userSettings.autoIdleThresholdMs`); presence status reuses `userStatuses`                               |
| **Appearance**    | theme mode                                                                | cookie (`THEME_COOKIE_NAME`) — needs the cookie for flash-free SSR; left as-is                                   |
| **Keybinds**      | app shortcut reference                                                    | none (read-only list for now; rebinding is future)                                                               |

No permission gating — every panel is self-scoped to the current user (unlike room settings, which gate via `SettingsPermissionMap`).

## Data Model Changes

New `userSettings` table (`packages/db-schema/src/schema/userSettingsInMessage.ts`), 1:1 on `userId` (PK, `onDelete: cascade`), `schema: messageSchema`:

| Column                            | Type                                                      | Default         |
| --------------------------------- | --------------------------------------------------------- | --------------- |
| `voiceInputMode`                  | `voice_input_mode` enum (`VoiceActivity` \| `PushToTalk`) | `VoiceActivity` |
| `pushToTalkKeybind`               | text                                                      | `""`            |
| `inputSensitivityDecibels`        | integer (CHECK −100..0)                                   | −50             |
| `isMuteOnJoin` / `isDeafenOnJoin` | boolean                                                   | false           |
| `defaultUserVolumePercentage`     | integer (CHECK 0..200)                                    | 100             |
| `autoIdleThresholdMs`             | integer (CHECK 60_000..86_400_000)                        | 600_000         |

Read returns the row or an unpersisted defaults object; the first update upserts (`onConflictDoUpdate` on `userId`). Migration is the user's to run (`pnpm db:gen` + `pnpm db:up` in `packages/db-schema`).

## Procedures / API

Both added to the existing `userRouter` (`server/trpc/routers/user.ts`), alongside `upsertStatus` / `updateUser`:

| Procedure            | Auth   | Input                                                                  | Purpose                                                        |
| -------------------- | ------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `readUserSettings`   | authed | —                                                                      | returns the user's `userSettings` row, or defaults if none yet |
| `updateUserSettings` | authed | partial settings (`updateUserSettingsInputSchema`, `refineAtLeastOne`) | upserts and returns the full row                               |

## Components

Parallel to `Message/Model/Room/Settings/`, under `Message/Model/User/Settings/`:

- `LeftSideBar.vue` — wraps the shared `MessageModelSettingsLeftSideBar`, renders a `LeftSideBarItem` per `UserSettingsListItemMap` entry, `v-model`s the active type (no permission filter).
- `LeftSideBarItem.vue` — icon + title + active state.
- `Content.vue` — wraps the shared `MessageModelSettingsContent`, renders `UserSettingsContentMap[settingsType]`.
- `Type/Account/Index.vue` · `Type/Profile/Index.vue` (reuses `UserProfileCard`) · `Type/Voice/Index.vue` · `Type/Notifications/Index.vue` · `Type/Appearance/Index.vue` · `Type/Keybinds/Index.vue`.

## Key Files

| File                                                            | Role                                                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`        | table + `VoiceInputMode` enum + select schema + range constants                                                      |
| `shared/models/db/userSettings/UpdateUserSettingsInput.ts`      | partial-update input schema (`refineAtLeastOne`)                                                                     |
| `server/trpc/routers/user.ts`                                   | `readUserSettings` + `updateUserSettings`                                                                            |
| `app/models/message/user/UserSettingsType.ts`                   | enum; values double as panel titles                                                                                  |
| `app/services/message/user/settings/UserSettingsListItemMap.ts` | sidebar icons                                                                                                        |
| `app/services/message/user/settings/UserSettingsContentMap.ts`  | lazy `Type/*/Index.vue` components                                                                                   |
| `app/services/message/user/settings/VoiceInputModeLabelMap.ts`  | enum → display label                                                                                                 |
| `app/store/message/user/settings/index.ts`                      | DB-backed store: `userSettings` ref, `readUserSettings`, optimistic `updateUserSettings` (revert + alert on failure) |
| `app/store/message/user/settings/voice.ts`                      | device-local store: mic/speaker/camera IDs in `localStorage`                                                         |
| `app/components/Message/LeftSideBar/Settings/DialogButton.vue`  | existing shell; now holds the active type + loads settings on open                                                   |

## Constraints / Notes

- **Single surface.** The fullscreen dialog is canonical; `pages/user/settings.vue` should fold into the Profile panel (the route can become a deep-link that opens the dialog).
- **Sync by default, per-device by exception.** Global prefs live in `userSettings` and sync; only hardware device IDs and UI collapsibles stay `localStorage` (a device chosen on one machine must not apply on another — Discord behaves the same).
- **Theme stays on the cookie** — it's the one pref with a hard SSR constraint (flash-free first paint). Folding it into `userSettings` later would need a cookie cache synced from the DB.
- **Pattern fidelity over novelty.** The user wrappers copy the room-settings structure; the only intentional divergence is dropping the permission map.
- Voice-pref _application_ to live calls (device switching, PTT gating, volume) is the dependent roadmap work, not this surface.
