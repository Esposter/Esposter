# The standalone call surface and its lobby

Read when working on `/calls` or `/calls/[id]`: the shareable link, the pre-join states, and knock/admit.

## Shareable call link

- `/calls` — standalone lobby; calls `createCall()` then navigates to `/calls/[id]`.
- `/calls/[id]` — full-screen standalone call; the creator auto-joins via the persisted `callSessionsInMessage.userId`, everyone else sees pre-join and must knock.
- `InviteCard.vue` sits in the call view both surfaces mount, and hides itself while `callRoomId` is set, so it shows only on `/calls/[id]`, where `window.location.href` is the correct link to copy.

## Knock/Admit (lobby/waiting room)

Scope: standalone calls only. Room calls stay gated by room membership/RBAC.

- `knockCall({ id })` — adds the caller to `callKnockerMap`, and the knock opens the call's socket once it is recorded, which the admission reuses. The doorkeeper's socket receives a `knockCall` frame.
- `admitKnocker`, `dismissKnocker` and the `knockCall` frame answer only the doorkeeper — who that is, and the one guard all three pass through, is `requireCallDoorkeeper` (`openspec/specs/esbabbler/calls/README.md`, "Standalone knock lobby"). `admitKnocker` adds a one-time session admission in `callAdmittedParticipantMap`, then the knocker receives a `knockerAdmitted` frame on its call socket.
- `/calls/[id]` states: `idle` (pre-join) → `knocking` (waiting overlay) → `joined` (full CallView).
- The creator (`callSessionsInMessage.userId`) skips straight to `joined`; everyone else must be admitted.
- `Message/Content/Call/JoinNotice/Index.vue` shows "Let in" / "Dismiss" per knocker.
