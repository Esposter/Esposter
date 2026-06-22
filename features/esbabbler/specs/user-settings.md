# Esbabbler — User Settings Surface

A Discord-style fullscreen settings dialog for **message/communication** preferences, built by reusing the room-settings machinery — kept deliberately separate from the **global** account/profile settings that live on the `/user/settings` route.

## Overview

There are two distinct surfaces, split along the backend boundary:

1. **Message-scoped settings dialog** — a fullscreen dialog (mirroring the room-settings pattern) holding only communication prefs: **Voice & Video, Notifications, Keybinds**. These map 1:1 to the DB-backed `userSettingsInMessage` table (under `messageSchema`), so the surface is consistent with the backend structure. Opened by the gear in `Message/LeftSideBar/StatusBar.vue`.
2. **Global user settings** — the existing `pages/user/settings.vue` route: account identity + profile (biography/avatar). Theme/appearance is handled by the top-right theme toggle, so it is **not** a settings panel.

The split exists because the persisted prefs are message-scoped by design (the table is literally `userSettingsInMessage`), whereas account identity/profile is `users`-backed and global. Keeping them on separate surfaces keeps each surface aligned with the schema that backs it.

The dialog mirrors the room-settings pattern (`SettingsType` enum → list-item map → content map → `Type/*` panels). Because the shared shells are already wrapped by room-settings, the user surface gets its **own** parallel wrappers under `Message/Model/User/Settings/` (exactly mirroring `Message/Model/Room/Settings/`).

Message prefs are **DB-backed** via the `userSettingsInMessage` table (1:1 on `userId`, mirroring `userStatuses`) so they sync across devices. Only genuinely per-device state stays in `localStorage`: hardware device IDs (mic/speaker/camera) and UI collapsibles.

## Categories

### Message-scoped dialog

Discord's User Settings, scoped to shipped communication features. Each panel maps to columns of `userSettingsInMessage`.

| Panel             | Holds                                                                     | Persistence                                                                                                               |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Voice & Video** | input mode, PTT keybind, sensitivity, default mute/deafen, default volume | server (`userSettingsInMessage`); device IDs stay `localStorage` — see [voice-video-settings.md](voice-video-settings.md) |
| **Notifications** | auto-idle threshold                                                       | server (`userSettingsInMessage.autoIdleThresholdMs`); presence status reuses `userStatuses`                               |
| **Keybinds**      | app shortcut reference                                                    | server (`userSettingsInMessage.pushToTalkKeybind`); rebinding the rest is future                                          |

No permission gating — every panel is self-scoped to the current user (unlike room settings, which gate via `SettingsPermissionMap`).

### Global route (`/user/settings`)

| Surface        | Holds                    | Persistence                                                                                 |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| **Account**    | email / account identity | server (`users`, read-only display via `UserIntroductionCard`)                              |
| **Profile**    | biography + avatar       | server (`users`, via `UserProfileCard` + SAS upload)                                        |
| **Appearance** | theme mode               | cookie (`THEME_COOKIE_NAME`) — surfaced by the top-right theme toggle, not a settings panel |

## Data Model Changes

`userSettingsInMessage` table (`packages/db-schema/src/schema/userSettingsInMessage.ts`), 1:1 on `userId` (PK, `onDelete: cascade`), `schema: messageSchema`:

| Column                            | Type                                                      | Default         |
| --------------------------------- | --------------------------------------------------------- | --------------- |
| `voiceInputMode`                  | `voice_input_mode` enum (`VoiceActivity` \| `PushToTalk`) | `VoiceActivity` |
| `pushToTalkKeybind`               | text                                                      | `""`            |
| `inputSensitivityDecibels`        | integer (CHECK −100..0)                                   | −50             |
| `isMuteOnJoin` / `isDeafenOnJoin` | boolean                                                   | false           |
| `defaultUserVolumePercentage`     | integer (CHECK 0..200)                                    | 100             |
| `autoIdleThresholdMs`             | integer (CHECK 60_000..86_400_000)                        | 600_000         |

Every column is message/communication-scoped — there is no account/profile/theme column, reinforcing the surface split. Read returns the row or an unpersisted defaults object; the first update upserts (`onConflictDoUpdate` on `userId`).

## Procedures / API

Both added to the existing `userRouter` (`server/trpc/routers/user.ts`), alongside `upsertStatus` / `updateUser`:

| Procedure            | Auth   | Input                                                                  | Purpose                                                                 |
| -------------------- | ------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `readUserSettings`   | authed | —                                                                      | returns the user's `userSettingsInMessage` row, or defaults if none yet |
| `updateUserSettings` | authed | partial settings (`updateUserSettingsInputSchema`, `refineAtLeastOne`) | upserts and returns the full row                                        |

## Components

Parallel to `Message/Model/Room/Settings/`, under `Message/Model/User/Settings/`:

- `Dialog.vue` — the fullscreen dialog; reads `isVisible` / `settingsType` from `useUserSettingsDialogStore`, loads settings on open. Mounted once globally in `App.vue` (`MessageModelUserSettingsDialog`, gated by session, mirroring the call-pip host).
- `LeftSideBar.vue` — wraps the shared `MessageModelSettingsLeftSideBar`. Two-level nav: `v-list :opened="[settingsType]"` + a `v-list-group` per `UserSettingsListItemMap` category; the active category expands to its sections (`UserSettingsSectionMap[settingsType]`), each highlighted when it is the active section and scrolled to via `useVGoTo`.
- `Content.vue` — wraps the shared `MessageModelSettingsContent`. Renders a sticky header (`settingsType` as a big `text-headline-medium` title + inline close button that sets `isVisible = false`) above `UserSettingsContentMap[settingsType]`.
- `Section.vue` — wraps each subsection: renders the section title header + anchor (`:id="title"`) and a `v-intersect` that writes `activeSectionId` to the dialog store (guarded by `isScrollingToSection`).
- `Type/Voice/Index.vue` · `Type/Notifications/Index.vue` · `Type/Keybinds/Index.vue` — each composes its subsections inside `MessageModelUserSettingsSection` wrappers.

The global route reuses the existing `UserIntroductionCard` + `UserProfileCard` on `pages/user/settings.vue` — no new components.

## Navigation / Scrollspy

Both the user and room dialogs dropped the separate right-sidebar component; the close button now lives inline with the content heading (sticky header). The user dialog adds a Discord-style two-level scrollspy nav, built entirely on Vuetify primitives (`v-list-group`, `v-intersect`, `useVGoTo` — no VueUse/scrollspy lib). See the `vuetify` skill "Scrollspy Sub-Nav" section for the reusable pattern. Section identity is a **per-panel subsection enum** (`VoiceSettingsSection` / `NotificationsSettingsSection` / `KeybindsSettingsSection`) whose values double as the section title and DOM id; `UserSettingsSectionMap` maps each `UserSettingsType` to its enum values.

## Key Files

| File                                                                                | Role                                                                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`                            | table + `VoiceInputMode` enum + select schema + range constants                                                      |
| `shared/models/db/userSettings/UpdateUserSettingsInput.ts`                          | partial-update input schema (`refineAtLeastOne`)                                                                     |
| `server/trpc/routers/user.ts`                                                       | `readUserSettings` + `updateUserSettings`                                                                            |
| `app/models/message/user/UserSettingsType.ts`                                       | enum (Voice / Notifications / Keybinds); values double as panel titles                                               |
| `app/services/message/user/settings/UserSettingsListItemMap.ts`                     | sidebar icons                                                                                                        |
| `app/services/message/user/settings/UserSettingsContentMap.ts`                      | lazy `Type/*/Index.vue` components                                                                                   |
| `app/services/message/user/settings/UserSettingsSectionMap.ts`                      | `Record<UserSettingsType, string[]>` — per-panel section enum values driving the sub-nav                             |
| `app/services/message/user/settings/VoiceInputModeLabelMap.ts`                      | enum → display label                                                                                                 |
| `app/services/message/settings/constants.ts`                                        | `SETTINGS_CONTENT_ID` — scroll-container id for `useVGoTo`                                                           |
| `app/models/message/user/settings/{Voice,Notifications,Keybinds}SettingsSection.ts` | per-panel subsection enums (value = title + DOM id)                                                                  |
| `app/store/message/user/settings/index.ts`                                          | DB-backed store: `userSettings` ref, `readUserSettings`, optimistic `updateUserSettings` (revert + alert on failure) |
| `app/store/message/user/settings/voice.ts`                                          | device-local store: mic/speaker/camera IDs in `localStorage`                                                         |
| `app/store/message/user/settings/dialog.ts`                                         | dialog UI store: `isVisible`, active `settingsType` (default Voice), `activeSectionId`, `isScrollingToSection`       |
| `app/components/Message/Model/User/Settings/Dialog.vue`                             | the fullscreen dialog, mounted globally in `App.vue`                                                                 |
| `app/components/Message/Model/User/Settings/Section.vue`                            | subsection wrapper: header + anchor + `v-intersect` scrollspy                                                        |
| `app/components/Message/Model/Settings/Content.vue`                                 | shared scroll shell; `#SETTINGS_CONTENT_ID` overflow container, `py-0` inner v-container                             |
| `app/components/Message/LeftSideBar/StatusBar.vue`                                  | gear button opens the dialog via `useUserSettingsDialogStore`                                                        |
| `app/pages/user/settings.vue`                                                       | global account/profile surface (`UserIntroductionCard` + `UserProfileCard`)                                          |

## Constraints / Notes

- **Two surfaces, split along the backend boundary.** The message dialog holds exactly what `userSettingsInMessage` persists (Voice / Notifications / Keybinds); the `/user/settings` route holds `users`-backed account/profile. This keeps each surface consistent with its schema.
- **Sync by default, per-device by exception.** Message prefs live in `userSettingsInMessage` and sync; only hardware device IDs and UI collapsibles stay `localStorage` (a device chosen on one machine must not apply on another — Discord behaves the same).
- **Theme stays on the cookie** — it's the one pref with a hard SSR constraint (flash-free first paint), already surfaced by the top-right theme toggle, so it is not a settings panel.
- **Pattern fidelity over novelty.** The user wrappers copy the room-settings structure; the only intentional divergence is dropping the permission map.
- Voice-pref _application_ to live calls (device switching, PTT gating, volume) is the dependent roadmap work, not this surface.
