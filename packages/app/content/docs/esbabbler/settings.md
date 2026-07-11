---
title: User settings
description: The message-scoped fullscreen settings dialog and its DB-backed userSettingsInMessage table.
---

# User Settings

A Discord-style fullscreen settings dialog for **message/communication** preferences, kept deliberately separate from the **global** account/profile settings on the `/user/settings` route. The split follows the backend boundary: the dialog holds exactly what the `userSettingsInMessage` table persists; the route holds `users`-backed identity.

## The two surfaces

| Surface                       | Panels                                   | Persistence                                                                      |
| ----------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| Message-scoped dialog         | Voice & Video · Notifications · Keybinds | `userSettingsInMessage` (synced); device IDs + UI collapsibles in `localStorage` |
| Global route `/user/settings` | Account · Profile                        | `users` (`UserIntroductionCard` + `UserProfileCard` + SAS avatar upload)         |
| Theme                         | top-right toggle, not a panel            | cookie (`THEME_COOKIE_NAME`) — hard SSR constraint (flash-free first paint)      |

The dialog is opened by the gear in `Message/LeftSideBar/StatusBar.vue` and mirrors the room-settings pattern (`SettingsType` enum → list-item map → content map → `Type/*` panels) with its own parallel wrappers under `Message/Model/User/Settings/`. Unlike room settings there is no permission gating — every panel is self-scoped to the current user.

**Sync by default, per-device by exception**: preferences live in the DB and sync across devices; only hardware device IDs (mic/speaker/camera — a device chosen on one machine must not apply on another) and UI collapsibles stay `localStorage`.

## Data model

`userSettingsInMessage` (`packages/db-schema/src/schema/userSettingsInMessage.ts`), 1:1 on `userId` (PK, cascade), under `messageSchema`:

| Column                                                   | Type                                                              | Default         |
| -------------------------------------------------------- | ----------------------------------------------------------------- | --------------- |
| `voiceInputMode`                                         | `voice_input_mode` enum (`VoiceActivity` \| `PushToTalk`)         | `VoiceActivity` |
| `pushToTalkKeybind`                                      | text                                                              | `""`            |
| `inputSensitivityDecibels`                               | integer (CHECK −100..0)                                           | −50             |
| `microphoneVolumePercentage` / `speakerVolumePercentage` | integer                                                           | 100             |
| `noiseSuppressionMode`                                   | enum → [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video) |                 |
| `isMuteOnJoin` / `isDeafenOnJoin`                        | boolean                                                           | false           |
| `defaultUserVolumePercentage`                            | integer (CHECK 0..200)                                            | 100             |
| `autoIdleThresholdMs`                                    | integer (CHECK 60_000..86_400_000)                                | 600_000         |

Every column is communication-scoped — no account/profile/theme columns, reinforcing the surface split. Read returns the row or an unpersisted defaults object; the first update upserts (`onConflictDoUpdate` on `userId`).

## Procedures

On the existing `user` router:

| Procedure            | Auth   | Input                                                                  | Purpose                                 |
| -------------------- | ------ | ---------------------------------------------------------------------- | --------------------------------------- |
| `readUserSettings`   | authed | —                                                                      | the user's row, or defaults if none yet |
| `updateUserSettings` | authed | partial settings (`updateUserSettingsInputSchema`, `refineAtLeastOne`) | upsert; returns the full row            |

The client store (`store/message/user/settings/index.ts`) applies updates optimistically and reverts + alerts on failure.

## Navigation / scrollspy

The dialog uses a Discord-style two-level nav: a `v-list-group` per `UserSettingsListItemMap` category whose sections come from `UserSettingsSectionMap` (per-panel subsection enums whose values double as section title **and** DOM id).

- **Scroll tracking is visibility-driven, not `v-intersect`.** Each `Section.vue` reports visibility via `useElementVisibility` into `visibleSectionIds`; `useSettingsScrollSpy` sets `activeSectionId` to the topmost visible section in map order. `v-intersect` was dropped because `IntersectionObserver` re-fires on any layout reflow — clicking a button inside a panel spuriously moved the sidebar highlight.
- **The panel header sits outside the scroll container** (the shared shell's fixed `#header` slot above the `flex-1` scroll div). That structural choice keeps the scrollspy simple: a section clipped above the scroll area is genuinely not visible, and `useVGoTo` lands a section title just below the header with no offset math. `scrollToSection` sets `activeSectionId` immediately and guards with `isScrollingToSection` so the highlight doesn't flicker through intermediate sections during the animated scroll.
- The active sub-item rail is the generic `StyledSlideIndicator` (`components/Styled/SlideIndicator.vue`) — measures the active item and slides to it via `translateY`, reusable for any vertical nav.

## Key files

| File                                                                         | Role                                           |
| :--------------------------------------------------------------------------- | :--------------------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`                     | table + enums + range constants                |
| `packages/app/server/trpc/routers/user.ts`                                   | `readUserSettings` + `updateUserSettings`      |
| `packages/app/app/models/message/user/UserSettingsType.ts`                   | panel enum (values double as titles)           |
| `packages/app/app/services/message/user/settings/`                           | list-item / content / section maps             |
| `packages/app/app/store/message/user/settings/index.ts`                      | DB-backed store (optimistic + revert)          |
| `packages/app/app/store/message/user/settings/voice.ts`                      | device-local store (`localStorage` device IDs) |
| `packages/app/app/store/message/user/settings/dialog.ts`                     | dialog UI store (visibility, scrollspy state)  |
| `packages/app/app/components/Message/Model/User/Settings/`                   | dialog + wrappers + `Type/*` panels            |
| `packages/app/app/composables/message/user/settings/useSettingsScrollSpy.ts` | topmost-visible-section scrollspy              |
| `packages/app/app/pages/user/settings.vue`                                   | global account/profile surface                 |

## Notes

The Voice & Video panel's content and how each setting applies to live LiveKit calls is its own page: [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video).
