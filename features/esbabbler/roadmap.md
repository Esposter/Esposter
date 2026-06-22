# Esbabbler — Roadmap

Prioritized, granular implementation backlog. Top = next up. Ordered so early items stay local/user-visible and later ones add background/cross-process work.

**Workflow:** check sub-items off as you build; when a feature is fully shipped, collapse it to one line under `## Shipped` in [README.md](README.md) and delete it here. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding anything new.

## Foundation — in progress

**User-settings surface** — → [specs/user-settings.md](specs/user-settings.md), [specs/voice-video-settings.md](specs/voice-video-settings.md). DB-backed via a new `userSettings` table (synced); device IDs + UI collapsibles stay `localStorage`. Mirrors the room-settings pattern under `Message/Model/User/Settings/`.

Built:

- [x] `userSettings` table + `VoiceInputMode` enum + select schema (`packages/db-schema`); `readUserSettings` / `updateUserSettings` on `userRouter`; `UpdateUserSettingsInput`.
- [x] `UserSettingsType` enum + `UserSettingsListItemMap` + `UserSettingsContentMap`; user wrappers (`LeftSideBar`/`LeftSideBarItem`/`Content`) + dialog wiring (loads settings on open).
- [x] Stores: `store/message/user/settings/index.ts` (DB-backed, optimistic + revert/alert) + `store/message/user/settings/voice.ts` (device IDs, `localStorage`).
- [x] Panels: Account, Profile (`UserProfileCard`), Voice & Video, Notifications (auto-idle), Appearance (theme), Keybinds (read-only reference).

Remaining:

- [x] **Run migration** — `pnpm db:gen` + `pnpm db:up` in `packages/db-schema` (user-run).
- [x] Split surfaces along the backend boundary: message-scoped dialog (Voice / Notifications / Keybinds, backed by `userSettingsInMessage`) opened from the messages-sidebar gear; global account/profile stays on the `/user/settings` route. Appearance/theme handled by the top-right toggle (no panel).
- [x] Sensitivity live meter — segmented yellow→green meter, driven by a dedicated `useMicrophoneLevel` Web Audio analyser (the "reuse the speaking-indicator analyser" premise was wrong — speaking state is LiveKit server-side, no local analyser existed).
- [x] **Discord-aligned Voice & Video panel + live-call application** → [specs/voice-video-settings.md](specs/voice-video-settings.md). Devices two-up, mic/speaker volume sliders, Input Profile (browser-native noise suppression, no Krisp), gradient Input Sensitivity slider. New `userSettings` fields (`microphoneVolumePercentage`, `speakerVolumePercentage`, `noiseSuppressionMode`); migration generated, **`db:up` pending (user-run)**. Applied to LiveKit: speaker volume (master output), noise mode (`audioCaptureDefaults` + `restartTrack`), mic gain + voice-activity gating via a native `MicrophoneProcessor` audio TrackProcessor. **Needs real two-party call verification.** Not yet: PTT keybind listener (PushToTalk mode is pass-through), Speaker Volume >100% boost (needs `webAudioMix`).

## Next — low-hanging fruit

Pick from the top; each extends something already shipped, no new infra. Independent of the user-settings foundation above.

- [ ] **Mention badges** — mention-only unread counts in the sidebar (reuse mention-highlight detection; new per-user count).
- [ ] **Per-user call volume (in-call)** — per-remote-participant volume slider via LiveKit `setVolume`, right-click → User Volume. Client-only, in-call state (Discord has no panel default for this).
- [ ] **Picture-in-Picture** — → [specs/picture-in-picture.md](specs/picture-in-picture.md). Browser PiP for the active call video tile.

## Later — larger or multi-area

- [ ] **Room-settings Discord alignment** — IA/naming parity with Discord Server Settings: rename Permissions → **Roles**, split **Members** + **Invites** into their own tabs, nest Webhooks under **Integrations**, group Word Filter under **Moderation**. No new behaviour — restructures the existing `Room/Settings/Type/*` panels.
- [ ] **Thread follows** — `threadFollowsInMessage` + notify-on-reply; "Threads" drawer filter (open/followed/participated). Multi-area: schema + notify path + UI.
- [ ] **Moderation/safety upgrades** — moderator notes; automod actions on `roomFiltersInMessage` (reject/warn/timeout); raid mode; audit-log filters; softban preview.
- [ ] **Room/sidebar UI polish** — density toggle, resizable persisted sidebars, category drag-ordering, role-colored member grouping, better empty states, mobile action bar, room header overflow menu.
- [ ] **File/media** — client-side image thumbnails before upload; room attachment limits + MIME categories; "files in this room" filter; Blob lifecycle notes. (Thumbnails were dropped in early planning; reopened here.)
- [ ] **Subscription/store cleanup pass** — finish auditing duplicated caller-side store mutations; add tests around stores that mutate in both wrappers and subscription handlers.
- [ ] **Search index ownership** — admin-only index status/rebuild tooling; document the `messages-index` schema in `architecture.md`.
