# Esbabbler — Roadmap

Prioritized, granular implementation backlog. Top = next up. Ordered so early items stay local/user-visible and later ones add background/cross-process work.

**Workflow:** check sub-items off as you build; when a feature is fully shipped, collapse it to one line under `## Shipped` in [README.md](README.md) and delete it here. Grep [out-of-scope/](out-of-scope) + [deferred/](deferred) before adding anything new.

## In progress

- [ ] **Scheduled-jobs listing/cancel UI** — backend done (schema, API, queue worker, `/remind` + `/schedule` dialogs). → [specs/scheduled-messages.md](specs/scheduled-messages.md), [specs/drafts-and-sent.md](specs/drafts-and-sent.md)
  - [ ] DB migration for `scheduledMessageJobsInMessage` (still pending — see [feedback: no auto db:gen])
  - [ ] `scheduledMessageJob.list({ roomId })` query — caller's pending jobs, soonest first
  - [ ] `scheduledMessageJob.cancel({ id })` mutation — delete the Storage Queue message + row
  - [ ] Listing dialog/drawer reachable from the composer, with per-row cancel
  - [ ] Empty state + relative "fires in …" timestamps

## Next — low-hanging fruit

Pick from the top; each extends something already shipped, no new infra.

- [ ] **Call-notes system message** — on call end, post a system message with duration + participant list. Reuses existing system-message + call-session-end hook.
- [ ] **Push-to-talk** — client-only mic gating in the call store (keybind hold → unmute). No backend.
- [ ] **Picture-in-Picture** — → [specs/picture-in-picture.md](specs/picture-in-picture.md). Browser PiP for the active call video tile.
- [ ] **Mention badges** — mention-only unread counts in the sidebar (reuse mention-highlight detection; new per-user count).
- [ ] **Thread follows** — `threadFollowsInMessage` + notify-on-reply; "Threads" drawer filter (open/followed/participated).

## Later — larger or multi-area

- [ ] **Moderation/safety upgrades** — moderator notes; automod actions on `roomFiltersInMessage` (reject/warn/timeout); raid mode; audit-log filters; softban preview.
- [ ] **Room/sidebar UI polish** — density toggle, resizable persisted sidebars, category drag-ordering, role-colored member grouping, better empty states, mobile action bar, room header overflow menu.
- [ ] **File/media** — client-side image thumbnails before upload; room attachment limits + MIME categories; "files in this room" filter; Blob lifecycle notes. (Thumbnails were dropped in early planning; reopened here.)
- [ ] **Subscription/store cleanup pass** — finish auditing duplicated caller-side store mutations; add tests around stores that mutate in both wrappers and subscription handlers.
- [ ] **Search index ownership** — admin-only index status/rebuild tooling; document the `messages-index` schema in `architecture.md`.
