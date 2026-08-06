# The standalone call surface and its lobby

Read when working on `/calls` or `/calls/[id]`: the shareable link, the pre-join states, and knock/admit.

## Shareable call link

- `/calls` — standalone lobby; calls `createCall()` then navigates to `/calls/[id]`.
- `/calls/[id]` — full-screen standalone call; the creator auto-joins via the persisted `callSessionsInMessage.userId`, everyone else sees pre-join and must knock.
- `InviteCard.vue` is only rendered on `/calls/[id]`, where `window.location.href` is the correct link to copy.

## Knock/Admit (lobby/waiting room)

Scope: standalone calls only. Room calls stay gated by room membership/RBAC.

- `knockCall({ id })` — adds the caller to `callKnockerMap`; emits `onKnockCall` to participants.
- `admitKnocker` / `dismissKnocker` — called by any participant; `admitKnocker` adds a one-time session admission in `callAdmittedParticipantMap`, then emits `onKnockerAdmitted` to the knocker.
- `/calls/[id]` states: `idle` (pre-join) → `knocking` (waiting overlay) → `joined` (full CallView).
- The creator (`callSessionsInMessage.userId`) skips straight to `joined`; everyone else must be admitted.
- `Message/Content/Call/JoinNotice/Index.vue` shows "Let In" / "Dismiss" per knocker.
