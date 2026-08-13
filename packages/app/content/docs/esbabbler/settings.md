---
title: User settings
description: The message-scoped fullscreen settings dialog and its DB-backed userSettingsInMessage table.
---

# User Settings

A Discord-style fullscreen settings dialog for **message/communication** preferences, kept deliberately separate from the **global** account/profile settings on the `/user/settings` route. The split follows the backend boundary: the dialog holds exactly what the `userSettingsInMessage` table persists; the route holds `users`-backed identity.

## The two surfaces

| Surface                       | Panels                                                | Persistence                                                                      |
| ----------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Message-scoped dialog         | Appearance · Voice & Video · Notifications · Keybinds | `userSettingsInMessage` (synced); device IDs + UI collapsibles in `localStorage` |
| Global route `/user/settings` | Account · Profile                                     | `users` (`UserIntroductionCard` + `UserProfileCard` + SAS avatar upload)         |
| Theme                         | top-right toggle, not a panel                         | cookie (`THEME_COOKIE_NAME`) — hard SSR constraint (flash-free first paint)      |

The dialog is opened by the gear in `MessageLeftSideBarStatusBar` and mirrors the [room settings](/docs/esbabbler/room-settings) pattern (`SettingsType` enum → list-item map → content map → `Type/*` panels) with its own parallel wrappers under `Message/Model/User/Settings/`. Unlike room settings there is no permission gating — every panel is self-scoped to the current user.

Both settings dialogs share three conventions: panels are lazy async components rendered inside `<Suspense>` with a shared `MessageModelSettingsSkeleton` fallback (shown on every tab switch); every settings mutation is **optimistic** (apply to the store immediately, mutate in the background, roll back + surface the error on failure — [`useMutation`](/docs/architecture/client-data)); and the sidebar section rail is `StyledSlideIndicator` stretched across **all** visible sections, pinned to the target while a click-scroll runs.

They also share the responsive shell: the sidebar drawer (`MessageModelSettingsLeftSideBar`) is `permanent` only on desktop and becomes a `temporary` overlay on `smAndDown`, opened by a `mdi-menu` hamburger the content header renders on mobile and closed on selection. The user dialog holds that open flag as `isDrawerOpen` on its dialog store; the room dialog threads it through its `Dialog`. See [room settings](/docs/esbabbler/room-settings) for the diagram.

**Sync by default, per-device by exception**: preferences live in the DB and sync across devices; only hardware device IDs (mic/speaker/camera — a device chosen on one machine must not apply on another) and UI collapsibles stay `localStorage`.

## Data model

`userSettingsInMessage` (`packages/db-schema/src/schema/userSettingsInMessage.ts`), 1:1 on `userId` (PK, cascade), under `messageSchema`:

| Column                                                   | Type                                                              | Default         |
| -------------------------------------------------------- | ----------------------------------------------------------------- | --------------- |
| `voiceInputMode`                                         | `voice_input_mode` enum (`VoiceActivity` \| `PushToTalk`)         | `VoiceActivity` |
| `pushToTalkKeybind`                                      | text                                                              | `""`            |
| `pushToTalkReleaseDelayMs`                               | integer (CHECK 0..2000)                                           | 20              |
| `inputSensitivityDecibels`                               | integer (CHECK −100..0)                                           | −50             |
| `microphoneVolumePercentage` / `speakerVolumePercentage` | integer                                                           | 100             |
| `noiseSuppressionMode`                                   | enum → [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video) |                 |
| `isMuteOnJoin` / `isDeafenOnJoin`                        | boolean                                                           | false           |
| `autoIdleThresholdMs`                                    | integer (CHECK 60_000..86_400_000)                                | 600_000         |

Every column is communication-scoped — no account/profile/theme columns, reinforcing the surface split. Read returns the row or an unpersisted defaults object; the first update upserts (`onConflictDoUpdate` on `userId`).

## Procedures

On the existing `user` router:

| Procedure            | Auth   | Input                                                                  | Purpose                                 |
| -------------------- | ------ | ---------------------------------------------------------------------- | --------------------------------------- |
| `readUserSettings`   | authed | —                                                                      | the user's row, or defaults if none yet |
| `updateUserSettings` | authed | partial settings (`updateUserSettingsInputSchema`, `refineAtLeastOne`) | upsert; returns the full row            |

The client store (`store/message/user/settings/index.ts`) applies updates optimistically and reverts + alerts on failure. The read is one record for the whole session, so it goes through [`useCachedRead`](/docs/architecture/caching) — every surface that raises the dialog asks for it, the concurrent asks join one request, and no write invalidates it because `updateUserSettings` stores the row it is answered with.

## Navigation / scrollspy

The dialog uses a Discord-style two-level nav: a `v-list-group` per `UserSettingsListItemMap` category whose sections come from `UserSettingsSectionMap` (per-panel subsection enums whose values double as section title **and** DOM id).

- **Scroll tracking is visibility-driven, not `v-intersect`.** Each `MessageModelUserSettingsSection` reports visibility via `useElementVisibility` into `visibleSectionIds`; `useSettingsScrollSpy` sets `activeSectionId` to the topmost visible section in map order. `v-intersect` was dropped because `IntersectionObserver` re-fires on any layout reflow — clicking a button inside a panel spuriously moved the sidebar highlight.
- **The panel header sits outside the scroll container** (the shared shell's fixed `#header` slot above the `flex-1` scroll div). That structural choice keeps the scrollspy simple: a section clipped above the scroll area is genuinely not visible, and `useVGoTo` lands a section title just below the header with no offset math. `scrollToSection` sets `activeSectionId` immediately and guards with `isScrollingToSection` so the highlight doesn't flicker through intermediate sections during the animated scroll.
- The active sub-item rail is the generic `StyledSlideIndicator` — measures the active item and slides to it via `translateY`, reusable for any vertical nav.

## Key files

| File                                                                         | Role                                                                 |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `packages/db-schema/src/schema/userSettingsInMessage.ts`                     | table + enums + range constants                                      |
| `packages/app/server/trpc/routers/user.ts`                                   | `readUserSettings` + `updateUserSettings`                            |
| `packages/app/app/models/message/user/UserSettingsType.ts`                   | panel enum (values double as titles)                                 |
| `packages/app/app/services/message/user/settings/`                           | list-item / content / section maps                                   |
| `packages/app/app/store/message/user/settings/index.ts`                      | DB-backed store (optimistic + revert)                                |
| `packages/app/app/store/message/user/settings/voice.ts`                      | device-local store (`localStorage` device IDs)                       |
| `packages/app/app/store/message/user/settings/dialog.ts`                     | dialog UI store (visibility, mobile `isDrawerOpen`, scrollspy state) |
| `packages/app/app/components/Message/Model/User/Settings/`                   | dialog + wrappers + `Type/*` panels                                  |
| `packages/app/app/composables/message/user/settings/useSettingsScrollSpy.ts` | topmost-visible-section scrollspy                                    |
| `packages/app/app/pages/user/settings.vue`                                   | global account/profile surface                                       |

## Notes

The Voice & Video panel's content and how each setting applies to live LiveKit calls is its own page: [/docs/esbabbler/voice-video](/docs/esbabbler/voice-video). The Appearance panel's Message Display density is covered by [/docs/esbabbler/room-ui](/docs/esbabbler/room-ui), and per-participant call volume — which is not a column here — by [/docs/esbabbler/calls/per-user-volume](/docs/esbabbler/calls/per-user-volume).
