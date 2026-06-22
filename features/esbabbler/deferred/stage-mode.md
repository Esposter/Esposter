# Stage Mode

A room setting where only users with `SpeakInStage` or `MuteMembers` publish microphone/camera by default — a town-hall / presentation call layout.

## Why deferred

- Stage/town-hall is a large-event feature; overkill for casual drop-in room calls.
- Adds a new `RoomPermission.SpeakInStage` bit (a permission-bitfield-shift migration) plus call-publishing gating, for a use case that has not come up.

## What already exists

The publish-gating mechanism is proven — the `StopScreenShare` admin action already revokes a LiveKit publish permission, so muting non-speakers by default is the same pattern, not new infrastructure.

## Revisit when

Rooms host large, presentation-style calls where most participants should be listeners by default.
