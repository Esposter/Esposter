# Esbabbler — Roadmap

Prioritized, granular implementation backlog. Top = next up. Ordered so early items stay local/user-visible and later ones add background/cross-process work.

**Workflow:** check sub-items off as you build; when a feature is fully shipped, collapse it to one line under `## Shipped` in [README.md](README.md) and delete it here. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding anything new.

## Foundation — do first (prerequisite)

**User-settings surface** — → [specs/user-settings.md](specs/user-settings.md), [specs/voice-video-settings.md](specs/voice-video-settings.md). The dialog is a skeleton today; build it out by mirroring the room-settings pattern. Push-to-talk, per-user volume default, and auto-idle have no home until this exists, so it gates them.

Scaffold (no DB — client prefs are `localStorage`-backed):

- [ ] `UserSettingsType` enum + `UserSettingsListItemMap` + `UserSettingsContentMap` (mirror the room-settings trio; no permission map).
- [ ] Wire `Message/Model/Settings/LeftSideBar.vue` (render items + `v-model` active type) and `Content.vue` (`<component :is>`); add `Message/Model/Settings/LeftSideBarItem.vue`.
- [ ] `store/user/settings/index.ts` (appearance, keybinds, auto-idle threshold) + `store/user/settings/voice.ts` — `localStorage`-backed, `getIsServer()`-guarded.

Panels (`Message/Model/Settings/Type/*/Index.vue`):

- [ ] **My Account** — email / account identity (read-only).
- [ ] **Profile** — bio + avatar; fold in `pages/user/settings.vue` so there is one profile editor.
- [ ] **Voice & Video** — push-to-talk (default off), device selects, input sensitivity meter, default mute/deafen, per-user volume default. Detail: [specs/voice-video-settings.md](specs/voice-video-settings.md).
- [ ] **Notifications** — default notification type + presence status (relocate shipped UI) + auto-idle threshold.
- [ ] **Appearance** — theme mode.
- [ ] **Keybinds** — Ctrl+K palette + call keybinds.

## Next — low-hanging fruit

Pick from the top; each extends something already shipped, no new infra. Independent of the user-settings foundation above.

- [ ] **Mention badges** — mention-only unread counts in the sidebar (reuse mention-highlight detection; new per-user count).
- [ ] **Per-user call volume (in-call)** — per-remote-participant volume slider via LiveKit `setVolume`, right-click → User Volume. Client-only; the _default_ lives in the Voice & Video panel above.
- [ ] **Picture-in-Picture** — → [specs/picture-in-picture.md](specs/picture-in-picture.md). Browser PiP for the active call video tile.

## Later — larger or multi-area

- [ ] **Room-settings Discord alignment** — IA/naming parity with Discord Server Settings: rename Permissions → **Roles**, split **Members** + **Invites** into their own tabs, nest Webhooks under **Integrations**, group Word Filter under **Moderation**. No new behaviour — restructures the existing `Room/Settings/Type/*` panels.
- [ ] **Thread follows** — `threadFollowsInMessage` + notify-on-reply; "Threads" drawer filter (open/followed/participated). Multi-area: schema + notify path + UI.
- [ ] **Moderation/safety upgrades** — moderator notes; automod actions on `roomFiltersInMessage` (reject/warn/timeout); raid mode; audit-log filters; softban preview.
- [ ] **Room/sidebar UI polish** — density toggle, resizable persisted sidebars, category drag-ordering, role-colored member grouping, better empty states, mobile action bar, room header overflow menu.
- [ ] **File/media** — client-side image thumbnails before upload; room attachment limits + MIME categories; "files in this room" filter; Blob lifecycle notes. (Thumbnails were dropped in early planning; reopened here.)
- [ ] **Subscription/store cleanup pass** — finish auditing duplicated caller-side store mutations; add tests around stores that mutate in both wrappers and subscription handlers.
- [ ] **Search index ownership** — admin-only index status/rebuild tooling; document the `messages-index` schema in `architecture.md`.
